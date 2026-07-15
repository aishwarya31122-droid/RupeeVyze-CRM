import { performanceRecords } from "../db.js";

export function list(req, res) {
  try { res.json(performanceRecords.all()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export function create(req, res) {
  try {
    const all = performanceRecords.all();
    const id = req.body.id || "PERF-" + String(all.length + 1).padStart(3, "0");
    const row = { ...req.body, id };
    performanceRecords.insert(row);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function update(req, res) {
  try {
    const existing = performanceRecords.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    performanceRecords.update(req.params.id, { ...existing, ...req.body, id: existing.id });
    res.json(performanceRecords.get(req.params.id));
  } catch (err) { res.status(500).json({ error: err.message }); }
}
