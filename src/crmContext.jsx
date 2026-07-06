import React, { createContext, useContext, useMemo, useState } from "react";
import { candidates as initialCandidates } from "./data/candidates.js";
import { businessConfigs, defaultBusinessSettings } from "./data/config.js";
import { pipelineStages, sources, recruiterNames } from "./data/dropdowns.js";
import { teamMembers as initialTeamMembers } from "./data/team.js";

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [settings, setSettings] = useState(defaultBusinessSettings);
  const [selectedConfigId, setSelectedConfigId] = useState(defaultBusinessSettings.selectedConfigId);
  const [teamMembers] = useState(initialTeamMembers);

  const selectedConfig = useMemo(
    () => businessConfigs.find((config) => config.id === selectedConfigId) || businessConfigs[0],
    [selectedConfigId]
  );

  const updateCandidateStage = (candidateId, stage) => {
    if (!pipelineStages.includes(stage)) return;
    setCandidates((list) =>
      list.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, stage } : candidate
      )
    );
  };

  const addCandidate = (candidate) => {
    const nextId = Math.max(0, ...candidates.map((item) => item.id)) + 1;
    setCandidates((list) => [
      ...list,
      {
        id: nextId,
        name: candidate.name,
        phone: candidate.phone,
        email: candidate.email,
        city: candidate.city,
        qualification: candidate.qualification,
        source: candidate.source || selectedConfig.defaultSource,
        stage: candidate.stage || pipelineStages[0],
        followUpDate: candidate.followUpDate || "",
        recruitedBy: candidate.recruitedBy || recruiterNames[0],
        trainingStatus: candidate.trainingStatus || "Pending",
        examResult: candidate.examResult || "Pending",
        adviserStatus: candidate.adviserStatus || "Lead",
        followUp: {
          type: candidate.followUp?.type || "Phone Call",
          priority: candidate.followUp?.priority || "Medium",
          status: candidate.followUp?.status || "Pending"
        },
        notes: candidate.notes || ""
      }
    ]);
  };

  const updateCandidate = (candidateId, updates) => {
    setCandidates((list) =>
      list.map((candidate) => {
        if (candidate.id !== candidateId) return candidate;
        return {
          ...candidate,
          ...updates,
          followUp: {
            ...candidate.followUp,
            ...(updates.followUp || {})
          }
        };
      })
    );
  };

  const markFollowUpDone = (candidateId) => {
    setCandidates((list) =>
      list.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, followUp: { ...candidate.followUp, status: "Done" } }
          : candidate
      )
    );
  };

  const updateCandidateNote = (candidateId, note) => {
    setCandidates((list) =>
      list.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, notes: note } : candidate
      )
    );
  };

  const value = {
    candidates,
    settings,
    selectedConfig,
    selectedConfigId,
    setSelectedConfigId,
    setSettings,
    updateCandidateStage,
    updateCandidate,
    addCandidate,
    markFollowUpDone,
    updateCandidateNote,
    pipelineStages,
    sources,
    recruiterNames,
    teamMembers
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside CrmProvider");
  return context;
}
