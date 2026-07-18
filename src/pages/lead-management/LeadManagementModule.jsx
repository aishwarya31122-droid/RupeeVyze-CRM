import { Routes, Route, Navigate } from "react-router-dom";
import LeadLayout from "./LeadLayout.jsx";
import LeadDashboard from "./LeadDashboard.jsx";
import Pipeline from "../Pipeline.jsx";
import TasksFollowUps from "./TasksFollowUps.jsx";
import AllLeads from "./AllLeads.jsx";
import CandidateDetails from "../CandidateDetails.jsx";

function LeadManagementModule() {
  return (
    <LeadLayout>
      <Routes>
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LeadDashboard />} />
        <Route
          path="pipeline"
          element={
            <Pipeline
              detailsPrefix="/adviser/lead-management/lead"
            />
          }
        />
        <Route path="tasks" element={<TasksFollowUps />} />
        <Route path="all" element={<AllLeads />} />
        <Route
          path="lead/:id"
          element={
            <CandidateDetails
            />
          }
        />
      </Routes>
    </LeadLayout>
  );
}

export default LeadManagementModule;
