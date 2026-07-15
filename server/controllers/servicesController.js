import { services } from "../db.js";

export function list(req, res) {
  try {
    const { search, status } = req.query;
    let rows = services.all();
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.clientName || "").toLowerCase().includes(q) ||
        (r.serviceType || "").toLowerCase().includes(q) ||
        (r.assignedTo || "").toLowerCase().includes(q)
      );
    }
    if (status) rows = rows.filter(r => r.status === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function create(req, res) {
  try {
    const all = services.all();
    const id = all.length + 1;
    const row = { id, ...req.body, createdDate: req.body.createdDate || new Date().toISOString().slice(0, 10) };
    services.insert(row);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function update(req, res) {
  try {
    const existing = services.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    services.update(req.params.id, { ...existing, ...req.body, id: existing.id });
    res.json(services.get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function remove(req, res) {
  try {
    const existing = services.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    services.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
