import { overridePayoutRecords } from "../db.js";

export function list(req, res) {
  try { res.json(overridePayoutRecords.all()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export function replaceAll(req, res) {
  try {
    overridePayoutRecords.replaceAll(Array.isArray(req.body) ? req.body : []);
    res.json(overridePayoutRecords.all());
  } catch (err) { res.status(500).json({ error: err.message }); }
}
