import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("MY_SERVICE_ROLE_KEY")!;
console.log("Service role key present:", !!SERVICE_ROLE_KEY, "length:", SERVICE_ROLE_KEY?.length || 0);

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401 });
    }

    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("Auth check failed:", userErr?.message);
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: callerProfile, error: profileErr } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    console.log("Caller user id:", userData.user.id);
    console.log("Profile lookup result:", JSON.stringify(callerProfile), "error:", profileErr?.message);

    if (profileErr || callerProfile?.role !== "admin") {
      console.error("Admin check failed. profileErr:", profileErr?.message, "role found:", callerProfile?.role);
      return new Response(JSON.stringify({ error: "Only admins can create advisor accounts" }), { status: 403 });
    }

    const { name, email, password, candidateId } = await req.json();
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "name, email, and password are required" }), { status: 400 });
    }

    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr || !newUser?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || "Failed to create user" }), { status: 400 });
    }

    const { error: insertErr } = await adminClient.from("profiles").insert({
      id: newUser.user.id,
      name,
      email,
      role: "advisor",
      advisor_candidate_id: candidateId ? String(candidateId) : null,
    });

    if (insertErr) {
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});