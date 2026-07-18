import { candidates, clients, performanceRecords, overridePayoutRecords } from "../db.js";
import { prepareLeadForSave } from "../workflow.js";

function parseCandidate(row) {
  if (!row) return null;
  const r = { ...row };
  try { r.timeline = typeof r.timeline === "string" ? JSON.parse(r.timeline) : (r.timeline || []); } catch { r.timeline = []; }
  try { r.activities = typeof r.activities === "string" ? JSON.parse(r.activities) : (r.activities || []); } catch { r.activities = []; }
  try { r.documents = typeof r.documents === "string" ? JSON.parse(r.documents) : (r.documents || []); } catch { r.documents = []; }
  try { r.communication = typeof r.communication === "string" ? JSON.parse(r.communication) : (r.communication || []); } catch { r.communication = []; }
  try { r.tasks = typeof r.tasks === "string" ? JSON.parse(r.tasks) : (r.tasks || []); } catch { r.tasks = []; }
  try { r.followUp = typeof r.followUp === "string" ? JSON.parse(r.followUp) : (r.followUp || {}); } catch { r.followUp = {}; }
  return r;
}

function applyWorkflowSideEffects(workflowResult) {
  const { shouldCreateAdvisorRecord, shouldCreateClientRecord, shouldCreatePerformanceRecord, performancePayload, clientPayload } = workflowResult;

  if (shouldCreatePerformanceRecord && performancePayload) {
    const existing = performanceRecords.all().find(
      r => r.advisorCode === performancePayload.advisorCode || r.advisorName === performancePayload.advisorName
    );
    if (!existing) {
      performanceRecords.insert({ ...performancePayload, id: `PERF-${String(performanceRecords.all().length + 1).padStart(3, "0")}` });
    }
  }

  if (shouldCreateClientRecord && clientPayload) {
    const existingClient = clients.all().find(c => c.clientId === clientPayload.clientId || c.name === clientPayload.name);
    if (!existingClient) {
      clients.insert(clientPayload);
    }
  }
}

export function list(req, res) {
  try {
    const { search, stage, source, recruiter, city, leadType, status } = req.query;
    let rows = candidates.all().map(parseCandidate);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.mobile || "").includes(q) ||
        (r.phone || "").includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.city || "").toLowerCase().includes(q) ||
        (r.leadId || "").toLowerCase().includes(q)
      );
    }
    if (stage) rows = rows.filter(r => r.workflowStage === stage);
    if (source) rows = rows.filter(r => (r.source || r.leadSource) === source);
    if (recruiter) rows = rows.filter(r => r.assignedTo === recruiter);
    if (city) rows = rows.filter(r => r.city === city);
    if (leadType) rows = rows.filter(r => r.leadType === leadType);
    if (status) rows = rows.filter(r => r.leadStatus === status);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function getById(req, res) {
  try {
    const row = candidates.get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(parseCandidate(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function create(req, res) {
  try {
    const b = req.body;
    const all = candidates.all();
    const maxId = all.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    const id = maxId + 1;
    const leadId = b.leadId || "LD-" + (1000 + id);
    const rawLead = {
      id, leadId,
      leadType: b.leadType || "Insurance Customer",
      name: b.name || "",
      mobile: b.mobile || b.phone || "",
      phone: b.phone || b.mobile || "",
      email: b.email || "",
      city: b.city || "",
      workflowStage: b.workflowStage || "New Lead",
      leadStatus: b.leadStatus || "Open",
      assignedTo: b.assignedTo || "",
      leadSource: b.leadSource || b.source || "",
      source: b.source || b.leadSource || "",
      priority: b.priority || "Medium",
      nextFollowUp: b.nextFollowUp || b.followUpDate || "",
      createdDate: b.createdDate || new Date().toISOString().slice(0, 10),
      notes: b.notes || "",
      policyNumber: b.policyNumber || "",
      advisorCode: b.advisorCode || "",
      timeline: b.timeline || [],
      activities: b.activities || [],
      documents: b.documents || [],
      communication: b.communication || [],
      tasks: b.tasks || [],
      followUp: b.followUp || { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" }
    };

    const result = prepareLeadForSave(rawLead, b, { isCreate: true });
    candidates.insert(result.lead);
    applyWorkflowSideEffects(result);
    res.status(201).json(parseCandidate(candidates.get(id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function update(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const b = req.body;
    const updates = {};
    const fields = ["leadType", "name", "mobile", "phone", "email", "city", "workflowStage", "leadStatus", "assignedTo", "leadSource", "source", "priority", "nextFollowUp", "notes", "policyNumber", "advisorCode", "timeline", "activities", "documents", "communication", "tasks"];
    fields.forEach(field => {
      if (b[field] !== undefined) updates[field] = b[field];
    });
    if (b.followUp !== undefined) {
      const existingFollowUp = typeof existing.followUp === "string" ? JSON.parse(existing.followUp) : (existing.followUp || {});
      updates.followUp = { ...existingFollowUp, ...(typeof b.followUp === "string" ? JSON.parse(b.followUp) : b.followUp) };
    }

    const result = prepareLeadForSave(existing, updates);
    candidates.update(req.params.id, result.lead);
    applyWorkflowSideEffects(result);
    res.json(parseCandidate(candidates.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function updateStage(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const result = prepareLeadForSave(existing, { workflowStage: req.body.stage });
    candidates.update(req.params.id, result.lead);
    applyWorkflowSideEffects(result);
    res.json(parseCandidate(candidates.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function updateNote(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const result = prepareLeadForSave(existing, { notes: req.body.note });
    candidates.update(req.params.id, result.lead);
    res.json(parseCandidate(candidates.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function updateFollowUp(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const followUp = typeof existing.followUp === "string" ? JSON.parse(existing.followUp) : (existing.followUp || {});
    const result = prepareLeadForSave(existing, { followUp: { ...followUp, ...req.body } });
    candidates.update(req.params.id, result.lead);
    res.json(parseCandidate(candidates.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function addTask(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    const tasks = Array.isArray(existing.tasks) ? existing.tasks : [];
    tasks.push(req.body);

    const result = prepareLeadForSave(existing, { tasks });
    candidates.update(req.params.id, result.lead);
    res.json(parseCandidate(candidates.get(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function remove(req, res) {
  try {
    const existing = candidates.get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    candidates.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function bulkCreate(req, res) {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "records array is required" });
    }
    const all = candidates.all();
    const existingPhones = new Set(
      all.map(r => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
    );
    let maxId = all.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    const created = [];
    for (const b of records) {
      const phone = String(b.mobile || b.phone || "").replace(/\D/g, "");
      if (phone && existingPhones.has(phone)) continue;
      if (phone) existingPhones.add(phone);
      maxId += 1;
      const id = maxId;
      const leadId = b.leadId || "LD-" + (1000 + id);
      const rawLead = {
        id, leadId,
        leadType: b.leadType || "Insurance Customer",
        name: b.name || "",
        mobile: b.mobile || b.phone || "",
        phone: b.phone || b.mobile || "",
        email: b.email || "",
        city: b.city || "",
        workflowStage: b.workflowStage || "New Lead",
        leadStatus: b.leadStatus || "Open",
        assignedTo: b.assignedTo || "",
        leadSource: b.leadSource || b.source || "",
        source: b.source || b.leadSource || "",
        priority: b.priority || "Medium",
        nextFollowUp: b.nextFollowUp || b.followUpDate || "",
        createdDate: b.createdDate || new Date().toISOString().slice(0, 10),
        notes: b.notes || "",
        qualification: b.qualification || "",
        trainingStatus: b.trainingStatus || "",
        examResult: b.examResult || "",
        policyNumber: b.policyNumber || "",
        advisorCode: b.advisorCode || "",
        timeline: b.timeline || [],
        activities: b.activities || [],
        documents: b.documents || [],
        communication: b.communication || [],
        tasks: b.tasks || [],
        followUp: b.followUp || { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" }
      };
      const result = prepareLeadForSave(rawLead, b, { isCreate: true });
      candidates.insert(result.lead);
      applyWorkflowSideEffects(result);
      created.push(result.lead);
    }
    res.status(201).json({ imported: created.length, skipped: records.length - created.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export function exportCsv(req, res) {
  try {
    const rows = candidates.all().map(parseCandidate);
    const header = "Name,Phone,Email,City,Source,Recruiter,Stage,Follow-up,Notes";
    const csvRows = rows.map(r =>
      [r.name, r.mobile || r.phone, r.email, r.city, r.source || r.leadSource, r.assignedTo, r.workflowStage, r.nextFollowUp, r.notes].map(v => "\"" + String(v || "").replace(/"/g, "\"\"") + "\"").join(",")
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=candidates.csv");
    res.send(header + "\n" + csvRows.join("\n"));
  } catch (err) { res.status(500).json({ error: err.message }); }
}
