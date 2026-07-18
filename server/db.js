import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    return { candidates: [], clients: [], performance_records: [], override_payout_records: [], team_members: [], settings: { id: 1, businessName: "", selectedConfigId: "standard", followUpReminderDays: 3, contactEmail: "" }, service_requests: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function save(data) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

class Table {
  constructor(tableName) {
    this.tableName = tableName;
  }
  _get() {
    const db = load();
    return db[this.tableName] || [];
  }
  _set(rows) {
    const db = load();
    db[this.tableName] = rows;
    save(db);
  }
  all() { return this._get(); }
  get(id) { return this._get().find(r => String(r.id) === String(id)); }
  insert(row) { const rows = this._get(); rows.push(row); this._set(rows); return row; }
  update(id, updates) {
    const rows = this._get();
    const idx = rows.findIndex(r => String(r.id) === String(id));
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...updates };
    this._set(rows);
    return rows[idx];
  }
  delete(id) {
    const rows = this._get().filter(r => String(r.id) !== String(id));
    this._set(rows);
  }
  replaceAll(rows) { this._set(rows); }
  clear() { this._set([]); }
}

class SettingsStore {
  get() { return load().settings || {}; }
  update(updates) {
    const db = load();
    db.settings = { ...db.settings, ...updates };
    save(db);
    return db.settings;
  }
}

export const candidates = new Table("candidates");
export const clients = new Table("clients");
export const performanceRecords = new Table("performance_records");
export const overridePayoutRecords = new Table("override_payout_records");
export const teamMembers = new Table("team_members");
export const services = new Table("service_requests");
export const settings = new SettingsStore();
