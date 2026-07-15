import { settings } from "../db.js";

export function get(req, res) {
  try { res.json(settings.get()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export function update(req, res) {
  try { res.json(settings.update(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
}
