import { Routes, Route, Navigate } from "react-router-dom";
import AdvisorLayout from "./AdvisorLayout.jsx";
import Recruitment from "./Recruitment.jsx";
import ActiveAdvisors from "./ActiveAdvisors.jsx";
import Payouts from "./Payouts.jsx";
import Business from "./Business.jsx";
import PerformanceTracker from "../PerformanceTracker.jsx";
import OverridePayoutTracker from "../OverridePayoutTracker.jsx";

function AdvisorOperationsModule({ performanceRecords, onPerformanceRecordsChange }) {
  return (
    <AdvisorLayout>
      <Routes>
        <Route path="" element={<Navigate to="recruitment" replace />} />
        <Route path="recruitment" element={<Recruitment />} />
        <Route path="active" element={<ActiveAdvisors />} />
        <Route path="performance" element={<PerformanceTracker performanceRecords={performanceRecords} onPerformanceRecordsChange={onPerformanceRecordsChange} />} />
        <Route path="overrides" element={<OverridePayoutTracker performanceRecords={performanceRecords} />} />
        <Route path="payouts" element={<Payouts />} />
        <Route path="business" element={<Business />} />
      </Routes>
    </AdvisorLayout>
  );
}

export default AdvisorOperationsModule;
