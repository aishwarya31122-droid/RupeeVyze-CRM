import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { candidatesApi, clientsApi, settingsApi, teamMembersApi, performanceApi, overridePayoutsApi } from "./api/endpoints.js";
import { pipelineStages, leadTypes, leadStatuses, advisorWorkflowStages, customerWorkflowStages, followUpRequiredStages, sources, stageBadge, advisorStatuses } from "./data/dropdowns.js";
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
    assignedAdvisorId: record.assignedAdvisorId || "",
    assignedAdvisorName: record.assignedAdvisorName || "",
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
      console.warn("All API calls failed, server is the single source of truth. No local storage fallback.");
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

  const advisorStageLifecycle = {
    "New Lead":          { leadType: "Advisor", leadStatus: "Open" },
    "First Contact":     { leadType: "Advisor", leadStatus: "Open" },
    "Interested":        { leadType: "Advisor", leadStatus: "In Progress" },
    "KYC":              { leadType: "Advisor", leadStatus: "In Progress" },
    "Training":          { leadType: "Advisor", leadStatus: "In Progress" },
    "Exam":              { leadType: "Advisor", leadStatus: "In Progress" },
    "Code Generation":   { leadType: "Advisor", leadStatus: "In Progress" },
    "Activation":        { leadType: "Advisor", leadStatus: "Active" },
    "Business Started":  { leadType: "Advisor", leadStatus: "Active" },
    "Dropped":           { leadType: "Advisor", leadStatus: "Dropped" }
  };

  const updateCandidateStage = useCallback(async (candidateId, stage) => {
    const validStages = new Set([...advisorWorkflowStages, ...customerWorkflowStages]);
    if (!validStages.has(stage)) return;

    try {
      await candidatesApi.updateStage(candidateId, { stage });
      setCandidates((prev) => {
        return prev.map((c) => {
          if (String(c.id) !== String(candidateId)) return c;
          const isAdvisorRecord = c.leadType === "Advisor" || c.leadType === "Recruitment";
          const lifecycle = isAdvisorRecord ? advisorStageLifecycle[stage] : null;
          return {
            ...c,
            workflowStage: stage,
            ...(lifecycle ? { leadType: lifecycle.leadType, leadStatus: lifecycle.leadStatus } : {})
          };
        });
      });
    } catch (err) {
      console.warn("API unavailable, stage updated locally:", err.message);
      setCandidates((prev) => {
        return prev.map((c) => {
          if (String(c.id) !== String(candidateId)) return c;
          const isAdvisorRecord = c.leadType === "Advisor" || c.leadType === "Recruitment";
          const lifecycle = isAdvisorRecord ? advisorStageLifecycle[stage] : null;
          return {
            ...c,
            workflowStage: stage,
            ...(lifecycle ? { leadType: lifecycle.leadType, leadStatus: lifecycle.leadStatus } : {})
          };
        });
      });
      if (stage === "Policy Issued" || stage === "Active Client" || stage === "Policy Purchased" || stage === "Premium Collected") {
        setCandidates((prev) => {
          const cand = prev.find((c) => String(c.id) === String(candidateId));
          if (cand && cand.leadType === "Insurance Customer") {
            setClients((prevClients) => {
              const alreadyClient = prevClients.some((cl) => cl.candidateId === String(cand.id));
              if (alreadyClient) return prevClients;
              const clientRecord = {
                id: prevClients.length + 1,
                clientId: `CL-${1000 + prevClients.length + 1}`,
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
              return [...prevClients, clientRecord];
            });
          }
          return prev;
        });
      }
    }
  }, [refreshCrmData]);

  const findDuplicate = useCallback((records, candidate) => {
    const normalize = (s) => (s || "").trim().toLowerCase();
    const name = normalize(candidate.name);
    const phone = normalize(candidate.mobile || candidate.phone);
    const qualification = normalize(candidate.qualification);
    const stage = normalize(candidate.workflowStage);
    if (!name || !phone) return null;
    return records.find((r) =>
      normalize(r.name) === name &&
      normalize(r.mobile || r.phone) === phone &&
      normalize(r.qualification) === qualification &&
      normalize(r.workflowStage) === stage
    ) || null;
  }, []);

  const addCandidate = useCallback(async (candidate) => {
    const payload = {
      ...candidate,
      leadType: candidate.leadType || leadTypes[0],
      leadStatus: candidate.leadStatus || leadStatuses[0],
      workflowStage: candidate.workflowStage || "New Lead",
      leadSource: candidate.leadSource || candidate.source || selectedConfig.defaultSource,
      source: candidate.source || candidate.leadSource || selectedConfig.defaultSource,
      assignedTo: candidate.assignedTo || "",
      assignedAdvisorId: candidate.assignedAdvisorId || "",
      assignedAdvisorName: candidate.assignedAdvisorName || "",
      createdDate: candidate.createdDate || new Date().toISOString().slice(0, 10),
      nextFollowUp: candidate.nextFollowUp || candidate.followUpDate || ""
    };
    try {
      const result = await candidatesApi.create(payload);
      setCandidates((prev) => {
        const dup = findDuplicate(prev, result);
        if (dup) return prev;
        return [...prev, result];
      });
    } catch (err) {
      console.warn("API unavailable, candidate added locally:", err.message);
      setCandidates((prev) => {
        const dup = findDuplicate(prev, candidate);
        if (dup) return prev;
        const record = normalizeLocalRecord(payload, 0, prev.length);
        return [...prev, record];
      });
    }
  }, [selectedConfig, refreshCrmData, findDuplicate]);

  const importCandidates = useCallback(async (records) => {
    const importId = `IMP-${Date.now()}`;
    try {
      const result = await candidatesApi.bulkCreate(records);
      setCandidates((prev) => {
        const existingPhones = new Set(
          prev.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
        );
        const imported = records.filter((r) => {
          const phone = String(r.mobile || r.phone || "").replace(/\D/g, "");
          if (phone && existingPhones.has(phone)) return false;
          if (phone) existingPhones.add(phone);
          return true;
        }).map((r, i) => ({ ...normalizeLocalRecord(r, i, prev.length), _importId: importId }));
        return [...prev, ...imported];
      });
      return { ...result, importId };
    } catch (err) {
      console.warn("API unavailable, importing locally:", err.message);
      setCandidates((prev) => {
        const existingPhones = new Set(
          prev.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
        );
        const imported = [];
        for (const record of records) {
          const phone = String(record.mobile || record.phone || "").replace(/\D/g, "");
          if (phone && existingPhones.has(phone)) continue;
          if (phone) existingPhones.add(phone);
          imported.push({ ...normalizeLocalRecord(record, imported.length, prev.length), _importId: importId });
        }
        return [...prev, ...imported];
      });
      return { imported: records.length, skipped: 0, importId };
    }
  }, [refreshCrmData]);

  const removeDuplicates = useCallback(() => {
    const seen = new Set();
    const normalize = (s) => (s || "").trim().toLowerCase();
    let removedCount = 0;
    setCandidates((prev) => {
      const originalLength = prev.length;
      const deduped = prev.filter((r) => {
        const key = [
          normalize(r.name),
          normalize(r.mobile || r.phone),
          normalize(r.qualification),
          normalize(r.workflowStage)
        ].join("::");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      removedCount = originalLength - deduped.length;
      return deduped;
    });
    return removedCount;
  }, []);

  const updateCandidate = useCallback(async (candidateId, updates) => {
    const applyUpdates = (prev) => {
      const updated = prev.map((c) => {
        if (String(c.id) !== String(candidateId)) return c;
        const merged = { ...c, ...updates };
        if (updates.mobile) merged.phone = updates.mobile;
        if (updates.phone) merged.mobile = updates.phone;
        if (updates.source) merged.leadSource = updates.source;
        if (updates.leadSource) merged.source = updates.leadSource;
        if (updates.followUpDate) merged.nextFollowUp = updates.followUpDate;
        if (updates.workflowStage && updates.workflowStage !== c.workflowStage) {
          const lifecycle = advisorStageLifecycle[updates.workflowStage];
          if (lifecycle) {
            merged.leadType = lifecycle.leadType;
            merged.leadStatus = lifecycle.leadStatus;
          }
        }
        return merged;
      });
      return updated;
    };
    const applyClientConversion = (prev) => {
      if (updates.leadStatus === "Policy Purchased" || updates.workflowStage === "Policy Purchased") {
        const cand = prev.find((c) => String(c.id) === String(candidateId));
        if (cand && cand.leadType === "Insurance Customer") {
          setClients((prevClients) => {
            const alreadyClient = prevClients.some((cl) => cl.candidateId === String(cand.id));
            if (alreadyClient) return prevClients;
            const clientRecord = {
              id: prevClients.length + 1,
              clientId: `CL-${1000 + prevClients.length + 1}`,
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
            return [...prevClients, clientRecord];
          });
        }
      }
      return prev;
    };
    try {
      await candidatesApi.update(candidateId, updates);
      setCandidates((prev) => applyClientConversion(applyUpdates(prev)));
    } catch (err) {
      console.warn("API unavailable, candidate updated locally:", err.message);
      setCandidates((prev) => applyClientConversion(applyUpdates(prev)));
    }
  }, [refreshCrmData]);

  const updateCandidateNote = useCallback(async (candidateId, note) => {
    try {
      await candidatesApi.updateNote(candidateId, { note });
      setCandidates((prev) => prev.map((c) => String(c.id) === String(candidateId) ? { ...c, notes: note } : c));
    } catch (err) {
      console.warn("API unavailable, note updated locally:", err.message);
      setCandidates((prev) => prev.map((c) => String(c.id) === String(candidateId) ? { ...c, notes: note } : c));
    }
  }, [refreshCrmData]);

  const markFollowUpDone = useCallback(async (candidateId) => {
    try {
      await candidatesApi.updateFollowUp(candidateId, { status: "Done" });
      setCandidates((prev) => prev.map((c) => String(c.id) === String(candidateId)
        ? { ...c, followUp: { ...(c.followUp || {}), status: "Done" } }
        : c
      ));
    } catch (err) {
      console.warn("API unavailable, follow-up marked done locally:", err.message);
      setCandidates((prev) => prev.map((c) => String(c.id) === String(candidateId)
        ? { ...c, followUp: { ...(c.followUp || {}), status: "Done" } }
        : c
      ));
    }
  }, [refreshCrmData]);

  const deleteCandidate = useCallback(async (candidateId) => {
    try {
      await candidatesApi.remove(candidateId);
      setCandidates((prev) => prev.filter((c) => String(c.id) !== String(candidateId)));
    } catch (err) {
      console.warn("API unavailable, candidate deleted locally:", err.message);
      setCandidates((prev) => prev.filter((c) => String(c.id) !== String(candidateId)));
    }
  }, [refreshCrmData]);

  const addClient = useCallback(async (client) => {
    try {
      const result = await clientsApi.create(client);
      setClients((prev) => [...prev, result]);
    } catch (err) {
      console.warn("API unavailable, adding client locally:", err.message);
      setClients((prev) => {
        const id = prev.length + 1;
        const record = { id, clientId: client.clientId || `CL-${1000 + id}`, ...client, dateReceived: client.dateReceived || new Date().toISOString().slice(0, 10) };
        return [...prev, record];
      });
    }
  }, [refreshCrmData]);

  const updateClient = useCallback(async (clientId, updates) => {
    try {
      const result = await clientsApi.update(clientId, updates);
      setClients((prev) => prev.map((c) => {
        if (String(c.id) !== String(clientId) && String(c.clientId) !== String(clientId)) return c;
        return { ...c, ...result };
      }));
    } catch (err) {
      console.warn("API unavailable, updating client locally:", err.message);
      setClients((prev) => prev.map((c) => {
        if (String(c.id) !== String(clientId) && String(c.clientId) !== String(clientId)) return c;
        return { ...c, ...updates };
      }));
    }
  }, [refreshCrmData]);

  const setSettings = useCallback(async (newSettings) => {
    try {
      const updated = await settingsApi.update(newSettings);
      setSettingsState(updated);
    } catch (err) {
      console.warn("API unavailable, saving settings locally:", err.message);
      setSettingsState(newSettings);
    }
  }, []);

  const addPerformanceRecord = useCallback(async (record) => {
    try {
      const existing = performanceRecords.find(
        (r) => r.advisorCode === record.advisorCode || r.advisorName === record.advisorName
      );
      if (existing) {
        await performanceApi.update(existing.id, record);
        setPerformanceRecords((prev) => prev.map((r) => r.id === existing.id ? { ...r, ...record } : r));
      } else {
        const result = await performanceApi.create(record);
        setPerformanceRecords((prev) => [...prev, result]);
      }
    } catch (err) {
      console.warn("API unavailable, saving performance record locally:", err.message);
      setPerformanceRecords((prev) => {
        const existing = prev.find((r) => r.advisorCode === record.advisorCode || r.advisorName === record.advisorName);
        if (existing) {
          return prev.map((r) => r.id === existing.id ? { ...r, ...record } : r);
        }
        return [...prev, { id: Date.now(), ...record }];
      });
    }
  }, [refreshCrmData, performanceRecords]);

  const updatePerformanceRecord = useCallback(async (id, data) => {
    try {
      await performanceApi.update(id, data);
      setPerformanceRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r));
    } catch (err) {
      console.warn("API unavailable, updating performance record locally:", err.message);
      setPerformanceRecords((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r));
    }
  }, [refreshCrmData]);

  const saveOverridePayoutRecords = useCallback(async (records) => {
    try {
      await overridePayoutsApi.replaceAll(records);
      setOverridePayoutRecords(records);
    } catch (err) {
      console.warn("API unavailable, saving override records locally:", err.message);
      setOverridePayoutRecords(records);
    }
  }, [refreshCrmData]);

  const importPolicies = useCallback(async (records) => {
    setPolicies((prev) => {
      const existingIds = new Set(prev.map((r) => String(r.policyNumber || r.id || "").toLowerCase()));
      const imported = records.filter((r) => {
        const key = String(r.policyNumber || r.id || "").toLowerCase();
        if (!key || existingIds.has(key)) return false;
        existingIds.add(key);
        return true;
      });
      return [...prev, ...imported];
    });
    return { imported: records.length, skipped: 0 };
  }, []);

  const importClaims = useCallback(async (records) => {
    setClaims((prev) => {
      const existingIds = new Set(prev.map((r) => String(r.claimId || r.id || "").toLowerCase()));
      const imported = records.filter((r) => {
        const key = String(r.claimId || r.id || "").toLowerCase();
        if (!key || existingIds.has(key)) return false;
        existingIds.add(key);
        return true;
      });
      return [...prev, ...imported];
    });
    return { imported: records.length, skipped: 0 };
  }, []);

  const importTeamMembers = useCallback(async (records) => {
    try {
      await refreshCrmData();
    } catch { /* ignore */ }
    setTeamMembers((prev) => {
      const existingIds = new Set(prev.map((r) => String(r.id || r.email || "").toLowerCase()));
      const imported = records.filter((r) => {
        const key = String(r.id || r.email || "").toLowerCase();
        if (!key || existingIds.has(key)) return false;
        existingIds.add(key);
        return true;
      });
      return [...prev, ...imported];
    });
    return { imported: records.length, skipped: 0 };
  }, [refreshCrmData]);

  const importRewards = useCallback(async (records) => {
    setRewards((prev) => {
      const existingIds = new Set(prev.map((r) => String(r.id || r.recordId || "").toLowerCase()));
      const imported = records.filter((r) => {
        const key = String(r.id || r.recordId || "").toLowerCase();
        if (!key || existingIds.has(key)) return false;
        existingIds.add(key);
        return true;
      });
      return [...prev, ...imported];
    });
    return { imported: records.length, skipped: 0 };
  }, []);

  const importFollowups = useCallback(async (records) => {
    const importId = `IMP-${Date.now()}`;
    try {
      const result = await candidatesApi.bulkCreate(records);
      setCandidates((prev) => {
        const existingPhones = new Set(
          prev.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
        );
        const imported = [];
        for (const record of records) {
          const phone = String(record.mobile || record.phone || "").replace(/\D/g, "");
          if (phone && existingPhones.has(phone)) continue;
          if (phone) existingPhones.add(phone);
          imported.push({ ...normalizeLocalRecord(record, imported.length, prev.length), _importId: importId });
        }
        return [...prev, ...imported];
      });
      return { imported: records.length, skipped: 0, importId };
    } catch (err) {
      console.warn("API unavailable, importing followups locally:", err.message);
      setCandidates((prev) => {
        const existingPhones = new Set(
          prev.map((r) => String(r.mobile || r.phone || "").replace(/\D/g, "")).filter(Boolean)
        );
        const imported = [];
        for (const record of records) {
          const phone = String(record.mobile || record.phone || "").replace(/\D/g, "");
          if (phone && existingPhones.has(phone)) continue;
          if (phone) existingPhones.add(phone);
          imported.push({ ...normalizeLocalRecord(record, imported.length, prev.length), _importId: importId });
        }
        return [...prev, ...imported];
      });
      return { imported: records.length, skipped: 0, importId };
    }
  }, [refreshCrmData]);

  const importServiceRequests = useCallback(async (records) => {
    setServiceRequests((prev) => {
      const existingIds = new Set(prev.map((r) => String(r.id || r.requestId || "").toLowerCase()));
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
      return [...prev, ...imported];
    });
    return { imported: records.length, skipped: 0 };
  }, []);

  const addTeamMember = useCallback(async (member) => {
    setTeamMembers((prev) => [...prev, { id: Date.now(), ...member, status: member.status || "Active" }]);
  }, []);

  const updateTeamMember = useCallback(async (memberId, updates) => {
    setTeamMembers((prev) => prev.map((m) => String(m.id) === String(memberId) ? { ...m, ...updates } : m));
  }, []);

  const deleteTeamMember = useCallback(async (memberId) => {
    setTeamMembers((prev) => prev.filter((m) => String(m.id) !== String(memberId)));
  }, []);

  const addRole = useCallback(async (role) => {
    setRoles((prev) => [...prev, { id: Date.now(), ...role, status: role.status || "Active" }]);
  }, []);

  const updateRole = useCallback(async (roleId, updates) => {
    setRoles((prev) => prev.map((r) => String(r.id) === String(roleId) ? { ...r, ...updates } : r));
  }, []);

  const deleteRole = useCallback(async (roleId) => {
    setRoles((prev) => prev.filter((r) => String(r.id) !== String(roleId)));
  }, []);

  const addPermission = useCallback(async (permission) => {
    setPermissions((prev) => [...prev, { id: Date.now(), ...permission }]);
  }, []);

  const updatePermission = useCallback(async (permId, updates) => {
    setPermissions((prev) => prev.map((p) => String(p.id) === String(permId) ? { ...p, ...updates } : p));
  }, []);

  const deletePermission = useCallback(async (permId) => {
    setPermissions((prev) => prev.filter((p) => String(p.id) !== String(permId)));
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
    setImportHistory((prev) => [...prev, entry]);
  }, []);

  const removeImportRecord = useCallback((importId) => {
    setImportHistory((prev) => prev.filter((r) => r.id !== importId));
  }, []);

  const removeImportedCandidates = useCallback((importId) => {
    const entry = importHistory.find((r) => r.id === importId);
    if (!entry || entry.type !== "candidates") return;
    setCandidates((prev) => prev.filter((c) => !c._importId || c._importId !== importId));
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

  const clearLeadData = useCallback(() => {
    setCandidates([]);
    setPerformanceRecords([]);
    setOverridePayoutRecords([]);
    setImportHistory([]);
    localStorage.removeItem(STORAGE_KEY_CANDIDATES);
    localStorage.removeItem(STORAGE_KEY_PERFORMANCE);
    localStorage.removeItem(STORAGE_KEY_OVERRIDES);
    localStorage.removeItem(STORAGE_KEY_IMPORT_HISTORY);
  }, []);

  const derivedRecruiterNames = useMemo(() => {
    const qualifiedStages = new Set(["Activation", "Business Started"]);
    return candidates
      .filter((c) => (c.leadType === "Advisor" || c.leadType === "Recruitment") && qualifiedStages.has(c.workflowStage) && (c.leadStatus === "Active" || c.leadStatus === "Active Advisor") && c.name)
      .map((c) => c.name)
      .filter((name, i, arr) => arr.indexOf(name) === i);
  }, [candidates]);

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
    findDuplicate,
    removeDuplicates,
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
    advisorStatuses,
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
    clearAllCrmData,
    clearLeadData
  }), [candidates, clients, settings, selectedConfig, selectedConfigId, performanceRecords, overridePayoutRecords, policies, claims, rewards, serviceRequests, roles, permissions, loading, teamMembers, derivedRecruiterNames, activeAdvisors, performanceSummary, overrideRecordsDerived, importHistory,
    updateCandidateStage, updateCandidate, addCandidate, importCandidates, deleteCandidate, addClient, updateClient, markFollowUpDone, updateCandidateNote, setSettings, addPerformanceRecord, updatePerformanceRecord, saveOverridePayoutRecords, importPolicies, importClaims, importTeamMembers, importRewards, importFollowups, importServiceRequests, addTeamMember, updateTeamMember, deleteTeamMember, addRole, updateRole, deleteRole,     addPermission, updatePermission, deletePermission, addImportRecord, removeImportRecord, removeImportedCandidates, clearAllCrmData, clearLeadData]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside CrmProvider");
  return context;
}
