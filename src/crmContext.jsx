import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { candidatesApi, clientsApi, settingsApi, teamMembersApi, performanceApi, overridePayoutsApi } from "./api/endpoints.js";
import { pipelineStages, leadTypes, leadStatuses, advisorWorkflowStages, customerWorkflowStages, followUpRequiredStages, sources, recruiterNames, stageBadge } from "./data/dropdowns.js";
import { businessConfigs, defaultBusinessSettings } from "./data/config.js";
import { getActiveAdvisorRows, getPerformanceSummary, getOverrideRecords } from "./pages/advisor-operations/advisorOperationsData.js";

const STORAGE_KEY_CANDIDATES = "crm_imported_candidates";
const STORAGE_KEY_CLIENTS = "crm_clients";
const STORAGE_KEY_PERFORMANCE = "crm_performance_records";
const STORAGE_KEY_OVERRIDES = "crm_override_records";
const STORAGE_KEY_SETTINGS = "crm_settings";
const STORAGE_KEY_POLICIES = "crm_policies";
const STORAGE_KEY_CLAIMS = "crm_claims";
const STORAGE_KEY_TEAM_MEMBERS = "crm_team_members";
const STORAGE_KEY_SERVICE_REQUESTS = "crm_service_requests";
const STORAGE_KEY_ROLES = "crm_roles";
const STORAGE_KEY_PERMISSIONS = "crm_permissions";
const STORAGE_KEY_REWARDS = "crm_rewards";
const STORAGE_KEY_IMPORT_HISTORY = "crm_import_history";

const DATA_STORAGE_KEYS = [
  STORAGE_KEY_CANDIDATES, STORAGE_KEY_CLIENTS, STORAGE_KEY_PERFORMANCE,
  STORAGE_KEY_OVERRIDES, STORAGE_KEY_POLICIES, STORAGE_KEY_CLAIMS,
  STORAGE_KEY_TEAM_MEMBERS, STORAGE_KEY_SERVICE_REQUESTS,
  STORAGE_KEY_ROLES, STORAGE_KEY_PERMISSIONS, STORAGE_KEY_REWARDS,
  STORAGE_KEY_IMPORT_HISTORY
];

function loadLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

function loadLocalCandidates() {
  return loadLocal(STORAGE_KEY_CANDIDATES);
}

function saveLocalCandidates(list) {
  saveLocal(STORAGE_KEY_CANDIDATES, list);
}

function loadLocalClients() {
  return loadLocal(STORAGE_KEY_CLIENTS);
}

function saveLocalClients(list) {
  saveLocal(STORAGE_KEY_CLIENTS, list);
}

function loadLocalPerformance() {
  return loadLocal(STORAGE_KEY_PERFORMANCE);
}

function saveLocalPerformance(list) {
  saveLocal(STORAGE_KEY_PERFORMANCE, list);
}

function loadLocalOverrides() {
  return loadLocal(STORAGE_KEY_OVERRIDES);
}

function saveLocalOverrides(list) {
  saveLocal(STORAGE_KEY_OVERRIDES, list);
}

function loadLocalPolicies() {
  return loadLocal(STORAGE_KEY_POLICIES);
}

function saveLocalPolicies(list) {
  saveLocal(STORAGE_KEY_POLICIES, list);
}

function loadLocalClaims() {
  return loadLocal(STORAGE_KEY_CLAIMS);
}

function saveLocalClaims(list) {
  saveLocal(STORAGE_KEY_CLAIMS, list);
}

function loadLocalTeamMembers() {
  return loadLocal(STORAGE_KEY_TEAM_MEMBERS);
}

function saveLocalTeamMembers(list) {
  saveLocal(STORAGE_KEY_TEAM_MEMBERS, list);
}

function loadLocalServiceRequests() {
  return loadLocal(STORAGE_KEY_SERVICE_REQUESTS);
}

function saveLocalServiceRequests(list) {
  saveLocal(STORAGE_KEY_SERVICE_REQUESTS, list);
}

function loadLocalRoles() {
  return loadLocal(STORAGE_KEY_ROLES);
}

function saveLocalRoles(list) {
  saveLocal(STORAGE_KEY_ROLES, list);
}

function loadLocalPermissions() {
  return loadLocal(STORAGE_KEY_PERMISSIONS);
}

function saveLocalPermissions(list) {
  saveLocal(STORAGE_KEY_PERMISSIONS, list);
}

function loadLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocalSettings(data) {
  saveLocal(STORAGE_KEY_SETTINGS, data);
}

function loadLocalImportHistory() {
  return loadLocal(STORAGE_KEY_IMPORT_HISTORY);
}

function saveLocalImportHistory(list) {
  saveLocal(STORAGE_KEY_IMPORT_HISTORY, list);
}

function loadLocalRewards() {
  return loadLocal(STORAGE_KEY_REWARDS);
}

function saveLocalRewards(list) {
  saveLocal(STORAGE_KEY_REWARDS, list);
}

function normalizeLocalRecord(record, index, existingCount) {
  const id = existingCount + index + 1;
  const phone = record.mobile || record.phone || "";
  const createdDate = record.createdDate || new Date().toISOString().slice(0, 10);
  const workflowStage = record.workflowStage || "New Lead";
  const nextFollowUp = record.nextFollowUp || "";
  const assignedTo = record.assignedTo || "";
  const priority = record.priority || "Medium";
  const source = record.source || record.leadSource || "";
  return {
    id,
    leadId: record.leadId || `LD-${1000 + id}`,
    leadType: record.leadType || "Insurance Customer",
    name: record.name || "",
    mobile: phone,
    phone: record.phone || phone,
    email: record.email || "",
    city: record.city || "",
    workflowStage,
    leadStatus: record.leadStatus || "Open",
    assignedTo,
    leadSource: source,
    source,
    priority,
    nextFollowUp,
    createdDate,
    notes: record.notes || "",
    qualification: record.qualification || "",
    trainingStatus: record.trainingStatus || "",
    examResult: record.examResult || "",
    policyNumber: record.policyNumber || "",
    advisorCode: record.advisorCode || "",
    timeline: record.timeline?.length ? record.timeline : [{ stage: "New Lead", date: createdDate }],
    activities: record.activities?.length ? record.activities : [],
    documents: record.documents?.length ? record.documents : [],
    communication: record.communication?.length ? record.communication : [],
    tasks: record.tasks?.length ? record.tasks : [],
    followUp: record.followUp || { type: "Phone Call", priority, status: "Pending", response: "" }
  };
}

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [candidates, setCandidates] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettingsState] = useState(defaultBusinessSettings);
  const [selectedConfigId, setSelectedConfigId] = useState(defaultBusinessSettings.selectedConfigId);
  const [teamMembers, setTeamMembers] = useState([]);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [overridePayoutRecords, setOverridePayoutRecords] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCrmData = useCallback(async () => {
    const settled = await Promise.allSettled([
      candidatesApi.list(),
      clientsApi.list(),
      settingsApi.get(),
      teamMembersApi.list(),
      performanceApi.list(),
      overridePayoutsApi.list()
    ]);
    const [candsResult, cltsResult, setsResult, teamResult, perfResult, overridesResult] = settled;

    if (candsResult.status === "fulfilled") {
      setCandidates(candsResult.value);
      saveLocalCandidates(candsResult.value);
    }
    if (cltsResult.status === "fulfilled") {
      setClients(cltsResult.value);
      saveLocalClients(cltsResult.value);
    }
    if (setsResult.status === "fulfilled") {
      setSettingsState(setsResult.value);
      setSelectedConfigId(setsResult.value.selectedConfigId || "standard");
      saveLocalSettings(setsResult.value);
    }
    if (teamResult.status === "fulfilled") {
      setTeamMembers(teamResult.value);
      saveLocalTeamMembers(teamResult.value);
    }
    if (perfResult.status === "fulfilled") {
      setPerformanceRecords(perfResult.value);
      saveLocalPerformance(perfResult.value);
    }
    if (overridesResult.status === "fulfilled") {
      setOverridePayoutRecords(overridesResult.value);
      saveLocalOverrides(overridesResult.value);
    }

    const allFailed = settled.every((r) => r.status === "rejected");
    if (allFailed) {
      console.warn("All API calls failed, using local storage fallback");
      const localCands = loadLocalCandidates();
      const localClts = loadLocalClients();
      const localSettings = loadLocalSettings();
      const localTeam = loadLocalTeamMembers();
      const localPerf = loadLocalPerformance();
      const localOverrides = loadLocalOverrides();
      setCandidates(localCands);
      setClients(localClts);
      setSettingsState(localSettings || defaultBusinessSettings);
      setSelectedConfigId((localSettings || defaultBusinessSettings).selectedConfigId || "standard");
      setTeamMembers(localTeam);
      setPerformanceRecords(localPerf);
      setOverridePayoutRecords(localOverrides);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        await refreshCrmData();
      } catch (err) {
        console.error("Failed to load CRM data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, [refreshCrmData]);

  const selectedConfig = useMemo(
    () => businessConfigs.find((c) => c.id === selectedConfigId) || businessConfigs[0],
    [selectedConfigId]
  );

  const updateCandidateStage = useCallback(async (candidateId, stage) => {
    const validStages = new Set([...advisorWorkflowStages, ...customerWorkflowStages]);
    if (!validStages.has(stage)) return;
    const local = loadLocalCandidates();
    const updated = local.map((c) => String(c.id) === String(candidateId) ? { ...c, workflowStage: stage } : c);
    saveLocalCandidates(updated);
    setCandidates(updated);
    if (stage === "Policy Issued" || stage === "Active Client" || stage === "Policy Purchased" || stage === "Premium Collected") {
      const cand = updated.find((c) => String(c.id) === String(candidateId));
      if (cand && cand.leadType === "Insurance Customer") {
        const localClients = loadLocalClients();
        const alreadyClient = localClients.some((cl) => cl.candidateId === String(cand.id));
        if (!alreadyClient) {
          const clientRecord = {
            id: localClients.length + 1,
            clientId: `CL-${1000 + localClients.length + 1}`,
            candidateId: String(cand.id),
            name: cand.name,
            email: cand.email || "",
            phone: cand.mobile || cand.phone || "",
            city: cand.city || "",
            policyNumber: cand.policyNumber || "",
            advisorAssigned: cand.assignedTo || "",
            dateReceived: new Date().toISOString().slice(0, 10),
            finalStatus: "Active Client",
            interestLevel: cand.priority || "Medium",
            leadQuality: cand.leadSource || cand.source || ""
          };
          const updatedClients = [...localClients, clientRecord];
          saveLocalClients(updatedClients);
          setClients(updatedClients);
        }
      }
    }
    try {
      await candidatesApi.updateStage(candidateId, { stage });
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, stage updated locally:", err.message);
    }
  }, [refreshCrmData]);

  const addCandidate = useCallback(async (candidate) => {
    const payload = {
      ...candidate,
      leadType: candidate.leadType || leadTypes[0],
      leadStatus: candidate.leadStatus || leadStatuses[0],
      workflowStage: candidate.workflowStage || "New Lead",
      leadSource: candidate.leadSource || candidate.source || selectedConfig.defaultSource,
      source: candidate.source || candidate.leadSource || selectedConfig.defaultSource,
      assignedTo: candidate.assignedTo || "",
      createdDate: candidate.createdDate || new Date().toISOString().slice(0, 10),
      nextFollowUp: candidate.nextFollowUp || candidate.followUpDate || ""
    };
    const local = loadLocalCandidates();
    const record = normalizeLocalRecord(payload, 0, local.length);
    const updated = [...local, record];
    saveLocalCandidates(updated);
    setCandidates(updated);
    try {
      await candidatesApi.create(payload);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, candidate added locally:", err.message);
    }
  }, [refreshCrmData, selectedConfig]);

  const importCandidates = useCallback(async (records) => {
    const importId = `IMP-${Date.now()}`;
    try {
      const result = await candidatesApi.bulkCreate(records);
      await refreshCrmData();
      return { ...result, importId };
    } catch (err) {
      console.warn("API unavailable, importing to local storage:", err.message);
      const localCandidates = loadLocalCandidates();
      const existingPhones = new Set(
        localCandidates.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
      );
      const imported = [];
      for (const record of records) {
        const phone = String(record.mobile || record.phone || "").replace(/\D/g, "");
        if (phone && existingPhones.has(phone)) continue;
        if (phone) existingPhones.add(phone);
        imported.push({ ...normalizeLocalRecord(record, imported.length, localCandidates.length), _importId: importId });
      }
      const updated = [...localCandidates, ...imported];
      saveLocalCandidates(updated);
      setCandidates(updated);
      return { imported: imported.length, skipped: records.length - imported.length, importId };
    }
  }, [refreshCrmData]);

  const updateCandidate = useCallback(async (candidateId, updates) => {
    const local = loadLocalCandidates();
    const updated = local.map((c) => {
      if (String(c.id) !== String(candidateId)) return c;
      const merged = { ...c, ...updates };
      if (updates.mobile) merged.phone = updates.mobile;
      if (updates.phone) merged.mobile = updates.phone;
      if (updates.source) merged.leadSource = updates.source;
      if (updates.leadSource) merged.source = updates.leadSource;
      if (updates.followUpDate) merged.nextFollowUp = updates.followUpDate;
      return merged;
    });
    saveLocalCandidates(updated);
    setCandidates(updated);
    if (updates.leadStatus === "Policy Purchased" || updates.workflowStage === "Policy Purchased") {
      const cand = updated.find((c) => String(c.id) === String(candidateId));
      if (cand && cand.leadType === "Insurance Customer") {
        const localClients = loadLocalClients();
        const alreadyClient = localClients.some((cl) => cl.candidateId === String(cand.id));
        if (!alreadyClient) {
          const clientRecord = {
            id: localClients.length + 1,
            clientId: `CL-${1000 + localClients.length + 1}`,
            candidateId: String(cand.id),
            name: cand.name,
            email: cand.email || "",
            phone: cand.mobile || cand.phone || "",
            city: cand.city || "",
            mobile: cand.mobile || cand.phone || "",
            policyNumber: cand.policyNumber || "",
            advisorAssigned: cand.assignedTo || "",
            dateReceived: new Date().toISOString().slice(0, 10),
            finalStatus: "Active Client",
            interestLevel: cand.priority || "Medium",
            leadSource: cand.leadSource || cand.source || ""
          };
          const updatedClients = [...localClients, clientRecord];
          saveLocalClients(updatedClients);
          setClients(updatedClients);
        }
      }
    }
    try {
      await candidatesApi.update(candidateId, updates);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, candidate updated locally:", err.message);
    }
  }, [refreshCrmData]);

  const updateCandidateNote = useCallback(async (candidateId, note) => {
    const local = loadLocalCandidates();
    const updated = local.map((c) => String(c.id) === String(candidateId) ? { ...c, notes: note } : c);
    saveLocalCandidates(updated);
    setCandidates(updated);
    try {
      await candidatesApi.updateNote(candidateId, { note });
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, note updated locally:", err.message);
    }
  }, [refreshCrmData]);

  const markFollowUpDone = useCallback(async (candidateId) => {
    const local = loadLocalCandidates();
    const updated = local.map((c) => String(c.id) === String(candidateId)
      ? { ...c, followUp: { ...(c.followUp || {}), status: "Done" } }
      : c
    );
    saveLocalCandidates(updated);
    setCandidates(updated);
    try {
      await candidatesApi.updateFollowUp(candidateId, { status: "Done" });
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, follow-up marked done locally:", err.message);
    }
  }, [refreshCrmData]);

  const deleteCandidate = useCallback(async (candidateId) => {
    const local = loadLocalCandidates();
    const updated = local.filter((c) => String(c.id) !== String(candidateId));
    saveLocalCandidates(updated);
    setCandidates(updated);
    try {
      await candidatesApi.remove(candidateId);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, candidate deleted locally:", err.message);
    }
  }, [refreshCrmData]);

  const addClient = useCallback(async (client) => {
    try {
      await clientsApi.create(client);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, adding client locally:", err.message);
      const local = loadLocalClients();
      const id = local.length + 1;
      const record = { id, clientId: client.clientId || `CL-${1000 + id}`, ...client, dateReceived: client.dateReceived || new Date().toISOString().slice(0, 10) };
      const updated = [...local, record];
      saveLocalClients(updated);
      setClients(updated);
    }
  }, [refreshCrmData]);

  const updateClient = useCallback(async (clientId, updates) => {
    try {
      await clientsApi.update(clientId, updates);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, updating client locally:", err.message);
      const local = loadLocalClients();
      const updated = local.map((c) => {
        if (String(c.id) !== String(clientId) && String(c.clientId) !== String(clientId)) return c;
        return { ...c, ...updates };
      });
      saveLocalClients(updated);
      setClients(updated);
    }
  }, [refreshCrmData]);

  const setSettings = useCallback(async (newSettings) => {
    try {
      const updated = await settingsApi.update(newSettings);
      setSettingsState(updated);
      saveLocalSettings(updated);
    } catch (err) {
      console.warn("API unavailable, saving settings locally:", err.message);
      setSettingsState(newSettings);
      saveLocalSettings(newSettings);
    }
  }, []);

  const addPerformanceRecord = useCallback(async (record) => {
    try {
      const existing = performanceRecords.find(
        (r) => r.advisorCode === record.advisorCode || r.advisorName === record.advisorName
      );
      if (existing) {
        await performanceApi.update(existing.id, record);
      } else {
        await performanceApi.create(record);
      }
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, saving performance record locally:", err.message);
      const local = loadLocalPerformance();
      const existing = local.find((r) => r.advisorCode === record.advisorCode || r.advisorName === record.advisorName);
      let updated;
      if (existing) {
        updated = local.map((r) => r.id === existing.id ? { ...r, ...record } : r);
      } else {
        updated = [...local, { id: Date.now(), ...record }];
      }
      saveLocalPerformance(updated);
      setPerformanceRecords(updated);
    }
  }, [refreshCrmData, performanceRecords]);

  const updatePerformanceRecord = useCallback(async (id, data) => {
    try {
      await performanceApi.update(id, data);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, updating performance record locally:", err.message);
      const local = loadLocalPerformance();
      const updated = local.map((r) => r.id === id ? { ...r, ...data } : r);
      saveLocalPerformance(updated);
      setPerformanceRecords(updated);
    }
  }, [refreshCrmData]);

  const saveOverridePayoutRecords = useCallback(async (records) => {
    try {
      await overridePayoutsApi.replaceAll(records);
      await refreshCrmData();
    } catch (err) {
      console.warn("API unavailable, saving override records locally:", err.message);
      saveLocalOverrides(records);
      setOverridePayoutRecords(records);
    }
  }, [refreshCrmData]);

  const importPolicies = useCallback(async (records) => {
    try {
      await refreshCrmData();
    } catch { /* ignore */ }
    const local = loadLocalPolicies();
    const existingIds = new Set(local.map((r) => String(r.policyNumber || r.id || "").toLowerCase()));
    const imported = records.filter((r) => {
      const key = String(r.policyNumber || r.id || "").toLowerCase();
      if (!key || existingIds.has(key)) return false;
      existingIds.add(key);
      return true;
    });
    const updated = [...local, ...imported];
    saveLocalPolicies(updated);
    setPolicies(updated);
    return { imported: imported.length, skipped: records.length - imported.length };
  }, [refreshCrmData]);

  const importClaims = useCallback(async (records) => {
    try {
      await refreshCrmData();
    } catch { /* ignore */ }
    const local = loadLocalClaims();
    const existingIds = new Set(local.map((r) => String(r.claimId || r.id || "").toLowerCase()));
    const imported = records.filter((r) => {
      const key = String(r.claimId || r.id || "").toLowerCase();
      if (!key || existingIds.has(key)) return false;
      existingIds.add(key);
      return true;
    });
    const updated = [...local, ...imported];
    saveLocalClaims(updated);
    setClaims(updated);
    return { imported: imported.length, skipped: records.length - imported.length };
  }, [refreshCrmData]);

  const importTeamMembers = useCallback(async (records) => {
    try {
      await refreshCrmData();
    } catch { /* ignore */ }
    const local = loadLocalTeamMembers();
    const existingIds = new Set(local.map((r) => String(r.id || r.email || "").toLowerCase()));
    const imported = records.filter((r) => {
      const key = String(r.id || r.email || "").toLowerCase();
      if (!key || existingIds.has(key)) return false;
      existingIds.add(key);
      return true;
    });
    const updated = [...local, ...imported];
    saveLocalTeamMembers(updated);
    setTeamMembers(updated);
    return { imported: imported.length, skipped: records.length - imported.length };
  }, [refreshCrmData]);

  const importRewards = useCallback(async (records) => {
    const existing = [...rewards];
    const existingIds = new Set(existing.map((r) => String(r.id || r.recordId || "").toLowerCase()));
    const imported = records.filter((r) => {
      const key = String(r.id || r.recordId || "").toLowerCase();
      if (!key || existingIds.has(key)) return false;
      existingIds.add(key);
      return true;
    });
    const updated = [...existing, ...imported];
    saveLocalRewards(updated);
    setRewards(updated);
    return { imported: imported.length, skipped: records.length - imported.length };
  }, [rewards]);

  const importFollowups = useCallback(async (records) => {
    const importId = `IMP-${Date.now()}`;
    try {
      const result = await candidatesApi.bulkCreate(records);
      await refreshCrmData();
      return { ...result, importId };
    } catch (err) {
      console.warn("API unavailable, importing followups locally:", err.message);
      const local = loadLocalCandidates();
      const existingPhones = new Set(
        local.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
      );
      const imported = [];
      for (const record of records) {
        const phone = String(record.mobile || record.phone || "").replace(/\D/g, "");
        if (phone && existingPhones.has(phone)) continue;
        if (phone) existingPhones.add(phone);
        imported.push({ ...normalizeLocalRecord(record, imported.length, local.length), _importId: importId });
      }
      const updated = [...local, ...imported];
      saveLocalCandidates(updated);
      setCandidates(updated);
      return { imported: imported.length, skipped: records.length - imported.length, importId };
    }
  }, [refreshCrmData]);

  const importServiceRequests = useCallback(async (records) => {
    const local = loadLocalServiceRequests();
    const existingIds = new Set(local.map((r) => String(r.id || r.requestId || "").toLowerCase()));
    const imported = records.filter((r) => {
      const key = String(r.id || r.requestId || r.serviceType + r.clientName || "").toLowerCase();
      if (!key || existingIds.has(key)) return false;
      existingIds.add(key);
      return true;
    }).map((r, i) => ({
      id: r.id || `SVC-${Date.now()}-${i}`,
      serviceType: r.serviceType || "General",
      clientName: r.clientName || "",
      assignedTo: r.assignedTo || "",
      status: r.status || "Open",
      priority: r.priority || "Medium",
      createdDate: r.createdDate || new Date().toISOString().slice(0, 10),
      notes: r.notes || ""
    }));
    const updated = [...local, ...imported];
    saveLocalServiceRequests(updated);
    setServiceRequests(updated);
    return { imported: imported.length, skipped: records.length - imported.length };
  }, []);

  const addTeamMember = useCallback(async (member) => {
    const local = loadLocalTeamMembers();
    const record = { id: Date.now(), ...member, status: member.status || "Active" };
    const updated = [...local, record];
    saveLocalTeamMembers(updated);
    setTeamMembers(updated);
  }, []);

  const updateTeamMember = useCallback(async (memberId, updates) => {
    const local = loadLocalTeamMembers();
    const updated = local.map((m) => String(m.id) === String(memberId) ? { ...m, ...updates } : m);
    saveLocalTeamMembers(updated);
    setTeamMembers(updated);
  }, []);

  const deleteTeamMember = useCallback(async (memberId) => {
    const local = loadLocalTeamMembers();
    const updated = local.filter((m) => String(m.id) !== String(memberId));
    saveLocalTeamMembers(updated);
    setTeamMembers(updated);
  }, []);

  const addRole = useCallback(async (role) => {
    const local = loadLocalRoles();
    const record = { id: Date.now(), ...role, status: role.status || "Active" };
    const updated = [...local, record];
    saveLocalRoles(updated);
    setRoles(updated);
  }, []);

  const updateRole = useCallback(async (roleId, updates) => {
    const local = loadLocalRoles();
    const updated = local.map((r) => String(r.id) === String(roleId) ? { ...r, ...updates } : r);
    saveLocalRoles(updated);
    setRoles(updated);
  }, []);

  const deleteRole = useCallback(async (roleId) => {
    const local = loadLocalRoles();
    const updated = local.filter((r) => String(r.id) !== String(roleId));
    saveLocalRoles(updated);
    setRoles(updated);
  }, []);

  const addPermission = useCallback(async (permission) => {
    const local = loadLocalPermissions();
    const record = { id: Date.now(), ...permission };
    const updated = [...local, record];
    saveLocalPermissions(updated);
    setPermissions(updated);
  }, []);

  const updatePermission = useCallback(async (permId, updates) => {
    const local = loadLocalPermissions();
    const updated = local.map((p) => String(p.id) === String(permId) ? { ...p, ...updates } : p);
    saveLocalPermissions(updated);
    setPermissions(updated);
  }, []);

  const deletePermission = useCallback(async (permId) => {
    const local = loadLocalPermissions();
    const updated = local.filter((p) => String(p.id) !== String(permId));
    saveLocalPermissions(updated);
    setPermissions(updated);
  }, []);

  const addImportRecord = useCallback((record) => {
    const entry = {
      id: record.id || `IMP-${Date.now()}`,
      type: record.type || "candidates",
      fileName: record.fileName || "Unknown",
      count: record.count || 0,
      timestamp: new Date().toISOString(),
      status: "success"
    };
    const updated = [...importHistory, entry];
    saveLocalImportHistory(updated);
    setImportHistory(updated);
  }, [importHistory]);

  const removeImportRecord = useCallback((importId) => {
    const updated = importHistory.filter((r) => r.id !== importId);
    saveLocalImportHistory(updated);
    setImportHistory(updated);
  }, [importHistory]);

  const removeImportedCandidates = useCallback((importId) => {
    const entry = importHistory.find((r) => r.id === importId);
    if (!entry || entry.type !== "candidates") return;
    const local = loadLocalCandidates();
    const updated = local.filter((c) => !c._importId || c._importId !== importId);
    saveLocalCandidates(updated);
    setCandidates(updated);
    removeImportRecord(importId);
  }, [importHistory, removeImportRecord]);

  const clearAllCrmData = useCallback(() => {
    setCandidates([]);
    setClients([]);
    setTeamMembers([]);
    setPerformanceRecords([]);
    setOverridePayoutRecords([]);
    setPolicies([]);
    setClaims([]);
    setServiceRequests([]);
    setRoles([]);
    setPermissions([]);
    setRewards([]);
    setImportHistory([]);
    DATA_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  const derivedRecruiterNames = useMemo(() => {
    if (teamMembers.length > 0) {
      return [...new Set(teamMembers.map((m) => m.name).filter(Boolean))];
    }
    return recruiterNames;
  }, [teamMembers]);

  const activeAdvisors = useMemo(
    () => getActiveAdvisorRows(candidates, performanceRecords),
    [candidates, performanceRecords]
  );

  const performanceSummary = useMemo(
    () => getPerformanceSummary(activeAdvisors),
    [activeAdvisors]
  );

  const overrideRecordsDerived = useMemo(
    () => getOverrideRecords(activeAdvisors, performanceRecords, overridePayoutRecords),
    [activeAdvisors, performanceRecords, overridePayoutRecords]
  );

  const value = useMemo(() => ({
    candidates,
    clients,
    settings,
    selectedConfig,
    selectedConfigId,
    setSelectedConfigId,
    setSettings,
    updateCandidateStage,
    updateCandidate,
    addCandidate,
    importCandidates,
    deleteCandidate,
    addClient,
    updateClient,
    markFollowUpDone,
    updateCandidateNote,
    performanceRecords,
    addPerformanceRecord,
    updatePerformanceRecord,
    overridePayoutRecords,
    saveOverridePayoutRecords,
    importPolicies,
    importClaims,
    importTeamMembers,
    importRewards,
    importFollowups,
    importServiceRequests,
    policies,
    claims,
    rewards,
    serviceRequests,
    roles,
    permissions,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addRole,
    updateRole,
    deleteRole,
    addPermission,
    updatePermission,
    deletePermission,
    loading,
    pipelineStages,
    leadTypes,
    leadStatuses,
    advisorWorkflowStages,
    customerWorkflowStages,
    followUpRequiredStages,
    sources,
    recruiterNames: derivedRecruiterNames,
    teamMembers,
    stageBadge,
    businessConfigs,
    activeAdvisors,
    performanceSummary,
    overrideRecordsDerived,
    importHistory,
    addImportRecord,
    removeImportRecord,
    removeImportedCandidates,
    clearAllCrmData
  }), [candidates, clients, settings, selectedConfig, selectedConfigId, performanceRecords, overridePayoutRecords, policies, claims, rewards, serviceRequests, roles, permissions, loading, teamMembers, derivedRecruiterNames, activeAdvisors, performanceSummary, overrideRecordsDerived, importHistory,
    updateCandidateStage, updateCandidate, addCandidate, importCandidates, deleteCandidate, addClient, updateClient, markFollowUpDone, updateCandidateNote, setSettings, addPerformanceRecord, updatePerformanceRecord, saveOverridePayoutRecords, importPolicies, importClaims, importTeamMembers, importRewards, importFollowups, importServiceRequests, addTeamMember, updateTeamMember, deleteTeamMember, addRole, updateRole, deleteRole,     addPermission, updatePermission, deletePermission, addImportRecord, removeImportRecord, removeImportedCandidates, clearAllCrmData]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside CrmProvider");
  return context;
}
