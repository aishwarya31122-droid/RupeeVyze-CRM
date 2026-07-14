import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard/index.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import CandidateDetails from "./pages/CandidateDetails.jsx";
import FollowUpTracker from "./pages/FollowUpTracker.jsx";
import Reports from "./pages/Reports.jsx";
import Details from "./pages/Details.jsx";
import TeamMembers from "./pages/TeamMembers.jsx";
import PerformanceTracker from "./pages/PerformanceTracker.jsx";
import OverridePayoutTracker from "./pages/OverridePayoutTracker.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Settings from "./pages/Settings.jsx";
import LeadManagementModule from "./pages/lead-management/LeadManagementModule.jsx";
import ClientCRMModule from "./pages/client-crm/ClientCRMModule.jsx";
import { initialPerformanceRecords } from "./data/performanceRecords.js";

function App() {
  const [performanceRecords, setPerformanceRecords] = useState(initialPerformanceRecords);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/client-crm/*" element={<ClientCRMModule />} />
        <Route
          path="/adviser/*"
          element={
            <Layout>
              <Routes>
                <Route path="" element={<Navigate to="/adviser/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="lead-management/*" element={<LeadManagementModule />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="candidate/:id" element={<CandidateDetails />} />
                <Route path="followups" element={<FollowUpTracker />} />
                <Route path="reports" element={<Reports />} />
                <Route path="details" element={<Details />} />
                <Route path="team" element={<TeamMembers />} />
                <Route path="performance" element={<PerformanceTracker performanceRecords={performanceRecords} onPerformanceRecordsChange={setPerformanceRecords} />} />
                <Route path="override-payout" element={<OverridePayoutTracker performanceRecords={performanceRecords} />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;