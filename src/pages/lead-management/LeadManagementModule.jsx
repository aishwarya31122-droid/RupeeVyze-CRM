import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LeadLayout from "./LeadLayout.jsx";
import LeadDashboard from "./LeadDashboard.jsx";
import LeadPipeline from "./LeadPipeline.jsx";
import AllLeads from "./AllLeads.jsx";
import LeadDetails from "./LeadDetails.jsx";
import { initialLeads } from "../../data/leads";

function LeadManagementModule() {
  const [leads, setLeads] = useState(initialLeads);

  const handleAddLead = (lead) => {
    setLeads((current) => [{ ...lead, id: `LD-${1000 + current.length + 1}`, leadId: lead.leadId || `LD-${1000 + current.length + 1}` }, ...current]);
  };

  const handleUpdateLead = (updated) => {
    setLeads((current) => current.map((l) => (l.id === updated.id ? updated : l)));
  };

  return (
    <LeadLayout leads={leads}>
      <Routes>
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LeadDashboard leads={leads} />} />
        <Route path="pipeline" element={<LeadPipeline leads={leads} />} />
        <Route path="all" element={<AllLeads leads={leads} />} />
        <Route path="lead/:id" element={<LeadDetails leads={leads} onUpdate={handleUpdateLead} />} />
      </Routes>
    </LeadLayout>
  );
}

export default LeadManagementModule;
