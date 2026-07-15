import { useCrm } from "../../crmContext.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import LeadLayout from "./LeadLayout.jsx";
import LeadDashboard from "./LeadDashboard.jsx";
import Pipeline from "../Pipeline.jsx";
import TasksFollowUps from "./TasksFollowUps.jsx";
import AllLeads from "./AllLeads.jsx";
import CandidateDetails from "../CandidateDetails.jsx";

function LeadManagementModule() {
  const { candidates, addCandidate, updateCandidate, updateCandidateStage, updateCandidateNote, advisorWorkflowStages, customerWorkflowStages, leadTypes, sources, recruiterNames } = useCrm();

  const handleAddLead = (lead) => {
    addCandidate({
      ...lead,
      leadId: lead.leadId || `LD-${1000 + candidates.length + 1}`,
      workflowStage: lead.workflowStage || "New Lead",
      leadStatus: lead.leadStatus || "Open",
      leadSource: lead.leadSource || lead.source || "Referral",
      source: lead.source || lead.leadSource || "Referral"
    });
  };

  const handleUpdateLead = (updated) => {
    updateCandidate(updated.id, updated);
  };

  const handleUpdateLeadStage = (id, workflowStage) => {
    updateCandidateStage(id, workflowStage);
  };

  const handleUpdateLeadNote = (id, note) => {
    updateCandidateNote(id, note);
  };

  return (
    <LeadLayout leads={candidates}>
      <Routes>
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LeadDashboard leads={candidates} />} />
        <Route
          path="pipeline"
          element={
            <Pipeline
              candidates={candidates}
              updateCandidateStage={handleUpdateLeadStage}
              updateCandidate={handleUpdateLead}
              updateCandidateNote={handleUpdateLeadNote}
              addCandidate={handleAddLead}
              advisorWorkflowStages={advisorWorkflowStages}
              customerWorkflowStages={customerWorkflowStages}
              leadTypes={leadTypes}
              sources={sources}
              recruiterNames={recruiterNames}
              detailsPrefix="/adviser/lead-management/lead"
            />
          }
        />
        <Route path="tasks" element={<TasksFollowUps leads={candidates} onUpdateLead={handleUpdateLead} />} />
        <Route path="all" element={<AllLeads leads={candidates} />} />
        <Route
          path="lead/:id"
          element={
            <CandidateDetails
              candidates={candidates}
              updateCandidate={handleUpdateLead}
              updateCandidateStage={handleUpdateLeadStage}
              updateCandidateNote={handleUpdateLeadNote}
            />
          }
        />
      </Routes>
    </LeadLayout>
  );
}

export default LeadManagementModule;
