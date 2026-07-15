import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { candidatesApi, clientsApi, settingsApi, teamMembersApi, performanceApi, overridePayoutsApi } from "./api/endpoints.js";
import { pipelineStages, leadTypes, leadStatuses, advisorWorkflowStages, customerWorkflowStages, sources, recruiterNames } from "./data/dropdowns.js";
import { businessConfigs, defaultBusinessSettings } from "./data/config.js";

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [candidates, setCandidates] = useState([]);
  const [clients, setClients] = useState([]);
  const [settings, setSettingsState] = useState(defaultBusinessSettings);
  const [selectedConfigId, setSelectedConfigId] = useState(defaultBusinessSettings.selectedConfigId);
  const [teamMembers, setTeamMembers] = useState([]);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [overridePayoutRecords, setOverridePayoutRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCrmData = useCallback(async () => {
    try {
      const [cands, clts, sets, team, perf, overrides] = await Promise.all([
        candidatesApi.list(),
        clientsApi.list(),
        settingsApi.get(),
        teamMembersApi.list(),
        performanceApi.list(),
        overridePayoutsApi.list()
      ]);
      setCandidates(cands);
      setClients(clts);
      setSettingsState(sets);
      setSelectedConfigId(sets.selectedConfigId || "standard");
      setTeamMembers(team);
      setPerformanceRecords(perf);
      setOverridePayoutRecords(overrides);
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    } finally {
      setLoading(false);
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
    try {
      await candidatesApi.updateStage(candidateId, { stage });
      await refreshCrmData();
    } catch (err) { console.error("updateCandidateStage failed:", err); }
  }, [refreshCrmData]);

  const addCandidate = useCallback(async (candidate) => {
    try {
      await candidatesApi.create({
        ...candidate,
        leadType: candidate.leadType || leadTypes[0],
        leadStatus: candidate.leadStatus || leadStatuses[0],
        workflowStage: candidate.workflowStage || "New Lead",
        leadSource: candidate.leadSource || candidate.source || selectedConfig.defaultSource,
        source: candidate.source || candidate.leadSource || selectedConfig.defaultSource,
        assignedTo: candidate.assignedTo || recruiterNames[0],
        createdDate: candidate.createdDate || new Date().toISOString().slice(0, 10),
        nextFollowUp: candidate.nextFollowUp || candidate.followUpDate || ""
      });
      await refreshCrmData();
    } catch (err) { console.error("addCandidate failed:", err); }
  }, [refreshCrmData, selectedConfig]);

  const updateCandidate = useCallback(async (candidateId, updates) => {
    try {
      await candidatesApi.update(candidateId, updates);
      await refreshCrmData();
    } catch (err) { console.error("updateCandidate failed:", err); }
  }, [refreshCrmData]);

  const updateCandidateNote = useCallback(async (candidateId, note) => {
    try {
      await candidatesApi.updateNote(candidateId, { note });
      await refreshCrmData();
    } catch (err) { console.error("updateCandidateNote failed:", err); }
  }, [refreshCrmData]);

  const markFollowUpDone = useCallback(async (candidateId) => {
    try {
      await candidatesApi.updateFollowUp(candidateId, { status: "Done" });
      await refreshCrmData();
    } catch (err) { console.error("markFollowUpDone failed:", err); }
  }, [refreshCrmData]);

  const deleteCandidate = useCallback(async (candidateId) => {
    try {
      await candidatesApi.remove(candidateId);
      await refreshCrmData();
    } catch (err) { console.error("deleteCandidate failed:", err); }
  }, [refreshCrmData]);

  const addClient = useCallback(async (client) => {
    try {
      await clientsApi.create(client);
      await refreshCrmData();
    } catch (err) { console.error("addClient failed:", err); }
  }, [refreshCrmData]);

  const updateClient = useCallback(async (clientId, updates) => {
    try {
      await clientsApi.update(clientId, updates);
      await refreshCrmData();
    } catch (err) { console.error("updateClient failed:", err); }
  }, [refreshCrmData]);

  const setSettings = useCallback(async (newSettings) => {
    try {
      const updated = await settingsApi.update(newSettings);
      setSettingsState(updated);
    } catch (err) { console.error("setSettings failed:", err); }
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
    } catch (err) { console.error("addPerformanceRecord failed:", err); }
  }, [refreshCrmData, performanceRecords]);

  const updatePerformanceRecord = useCallback(async (id, data) => {
    try {
      await performanceApi.update(id, data);
      await refreshCrmData();
    } catch (err) { console.error("updatePerformanceRecord failed:", err); }
  }, [refreshCrmData]);

  const saveOverridePayoutRecords = useCallback(async (records) => {
    try {
      await overridePayoutsApi.replaceAll(records);
      await refreshCrmData();
    } catch (err) { console.error("saveOverridePayoutRecords failed:", err); }
  }, [refreshCrmData]);

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
    loading,
    pipelineStages,
    leadTypes,
    leadStatuses,
    advisorWorkflowStages,
    customerWorkflowStages,
    sources,
    recruiterNames,
    teamMembers
  }), [candidates, clients, settings, selectedConfig, selectedConfigId, performanceRecords, overridePayoutRecords, loading, teamMembers,
    updateCandidateStage, updateCandidate, addCandidate, deleteCandidate, addClient, updateClient, markFollowUpDone, updateCandidateNote, setSettings, addPerformanceRecord, updatePerformanceRecord, saveOverridePayoutRecords]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside CrmProvider");
  return context;
}
