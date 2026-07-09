import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientCRMLayout from "./ClientCRMLayout";
import ClientDashboard from "./ClientDashboard";
import ClientPipeline from "./ClientPipeline";
import ClientDetailsPage from "./ClientDetailsPage";
import FollowUpTracker from "./FollowUpTracker";
import ReportsAnalytics from "./ReportsAnalytics";
import ClientForm from "./ClientForm";
import { initialClientLeads } from "../../data/clientCrmData";

function ClientCRMModule() {
  const [leads, setLeads] = useState(initialClientLeads);

  const handleAddLead = (lead) => {
    setLeads((current) => [
      {
        ...lead,
        id: `CL-${String(current.length + 1001).padStart(4, "0")}`,
        clientId: lead.clientId || `CLI-${String(current.length + 2001).padStart(4, "0")}`,
        activity: [{ text: "Lead added", time: "Just now" }]
      },
      ...current
    ]);
  };

  const handleUpdateLead = (updatedLead) => {
    setLeads((current) => current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)));
  };

  return (
    <ClientCRMLayout>
      <Routes>
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard leads={leads} />} />
        <Route path="pipeline" element={<ClientPipeline leads={leads} onAddLead={() => {}} />} />
        <Route path="details" element={<ClientDetailsPage leads={leads} onEditLead={handleUpdateLead} />} />
        <Route path="followups" element={<FollowUpTracker leads={leads} onUpdateLead={handleUpdateLead} />} />
        <Route path="reports" element={<ReportsAnalytics leads={leads} />} />
        <Route path="add" element={<ClientForm onSubmit={handleAddLead} />} />
        <Route path="edit/:id" element={<ClientForm leads={leads} onSubmit={handleUpdateLead} />} />
        <Route path="client/:id" element={<ClientDetailsPage leads={leads} onEditLead={handleUpdateLead} />} />
      </Routes>
    </ClientCRMLayout>
  );
}

export default ClientCRMModule;
