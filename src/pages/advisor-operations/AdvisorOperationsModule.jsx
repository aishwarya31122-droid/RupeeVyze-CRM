import { Routes, Route, Navigate } from "react-router-dom";
import AdvisorLayout from "./AdvisorLayout.jsx";
import Recruitment from "./Recruitment.jsx";
import ActiveAdvisors from "./ActiveAdvisors.jsx";
import Business from "./Business.jsx";
import PerformanceTracker from "../PerformanceTracker.jsx";
import OverridePayoutTracker from "../OverridePayoutTracker.jsx";

function AdvisorOperationsModule() {
  return (
    <AdvisorLayout>
      <Routes>
        <Route path="" element={<Navigate to="recruitment" replace />} />
        <Route path="recruitment" element={<Recruitment />} />
        <Route path="active" element={<ActiveAdvisors />} />
        <Route path="performance" element={<PerformanceTracker />} />
        <Route path="overrides" element={<Navigate to="override-payouts" replace />} />
        <Route path="payouts" element={<Navigate to="override-payouts" replace />} />
        <Route path="override-payouts" element={<OverridePayoutTracker />} />
        <Route path="business" element={<Business />} />
      </Routes>
    </AdvisorLayout>
  );
}

export default AdvisorOperationsModule;
