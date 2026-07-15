import { clients } from "../db.js";

function parseClient(row) {
  if (!row) return null;
  const r = { ...row };
  try { r.policies = typeof r.policies === "string" ? JSON.parse(r.policies) : (r.policies || []); } catch { r.policies = []; }
  try { r.claims = typeof r.claims === "string" ? JSON.parse(r.claims) : (r.claims || []); } catch { r.claims = []; }
  try { r.renewals = typeof r.renewals === "string" ? JSON.parse(r.renewals) : (r.renewals || []); } catch { r.renewals = []; }
  try { r.activity = typeof r.activity === "string" ? JSON.parse(r.activity) : (r.activity || []); } catch { r.activity = []; }
  if (r.proposalSent !== undefined) r.proposalSent = Boolean(r.proposalSent);
  if (r.kycStarted !== undefined) r.kycStarted = Boolean(r.kycStarted);
  if (r.policyIssued !== undefined) r.policyIssued = Boolean(r.policyIssued);
  return r;
}

export function list(req, res) {
  try {
    const { search, status } = req.query;
    let rows = clients.all().map(parseClient);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.city || "").toLowerCase().includes(q) ||
        (r.advisorAssigned || "").toLowerCase().includes(q)
      );
    }
    if (status) rows = rows.filter(r => r.finalStatus === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function getById(req, res) {
  try {
    const all = clients.all();
    const row = all.find(r => String(r.id) === String(req.params.id) || String(r.clientId) === String(req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(parseClient(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function create(req, res) {
  try {
    const b = req.body;
    const all = clients.all();
    const numId = all.length + 1001;
    const id = b.id || "CL-" + String(numId).padStart(4, "0");
    const clientId = b.clientId || "CLI-" + String(all.length + 2001).padStart(4, "0");
    const row = { ...b, id, clientId };
    clients.insert(row);
    res.status(201).json(parseClient(clients.get(id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function update(req, res) {
  try {
    const existing = clients.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    clients.update(req.params.id, { ...existing, ...req.body, id: existing.id, clientId: existing.clientId });
    res.json(parseClient(clients.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function getPolicies(req, res) {
  try {
    const { search, status } = req.query;
    let rows = [];
    clients.all().map(parseClient).forEach(c => {
      (c.policies || []).forEach(p => {
        rows.push({ ...p, clientName: c.name, advisor: c.advisorAssigned || c.advisorName, clientId: c.clientId });
      });
    });
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => (r.policyNumber || "").toLowerCase().includes(q) || (r.clientName || "").toLowerCase().includes(q) || (r.advisor || "").toLowerCase().includes(q));
    }
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function getClaims(req, res) {
  try {
    const { search, status } = req.query;
    let rows = [];
    clients.all().map(parseClient).forEach(c => {
      (c.claims || []).forEach(cl => {
        rows.push({ ...cl, clientName: c.name, clientId: c.clientId });
      });
    });
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => (r.clientName || "").toLowerCase().includes(q) || (r.policyNumber || "").toLowerCase().includes(q) || (r.remarks || "").toLowerCase().includes(q));
    }
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function getRenewals(req, res) {
  try {
    const { search, status } = req.query;
    let rows = [];
    clients.all().map(parseClient).forEach(c => {
      (c.renewals || []).forEach(rn => {
        rows.push({ ...rn, clientName: c.name, clientId: c.clientId });
      });
    });
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => (r.clientName || "").toLowerCase().includes(q) || (r.policyNumber || "").toLowerCase().includes(q) || (r.advisor || "").toLowerCase().includes(q));
    }
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
