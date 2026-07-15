import { teamMembers } from "../db.js";

export function list(req, res) {
  try { res.json(teamMembers.all()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}
