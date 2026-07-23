import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { useCrm } from "../crmContext.jsx";

const ADVISOR_QUALIFIED_STAGES = new Set(["Activated", "Activated Advisor"]);

function Login() {
  const { users, login, setDynamicAdvisors } = useAuth();
  const { candidates } = useCrm();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const advisors = candidates
      .filter((c) => (c.leadType === "Advisor" || c.leadType === "Recruitment") && ADVISOR_QUALIFIED_STAGES.has(c.workflowStage) && c.leadStatus === "Active" && c.name)
      .map((c) => ({ id: String(c.id), name: c.name, role: "advisor", email: c.email || "" }));
    setDynamicAdvisors(advisors);
  }, [candidates, setDynamicAdvisors]);

  const handleLogin = () => {
    if (!selected) return;
    login(selected);
    navigate("/adviser/dashboard", { replace: true });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.25rem" }}>RupeeVyze Insurance CRM</h1>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem", fontSize: "0.875rem" }}>Select a user to sign in</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {users.map((user) => (
            <label
              key={user.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                border: selected === user.id ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                background: selected === user.id ? "#eef2ff" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="user"
                value={user.id}
                checked={selected === user.id}
                onChange={() => setSelected(user.id)}
                style={{ accentColor: "#4f46e5", width: "18px", height: "18px" }}
              />
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>{user.name}</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "capitalize" }}>{user.role}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selected}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: selected ? "#4f46e5" : "#cbd5e1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: selected ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default Login;
