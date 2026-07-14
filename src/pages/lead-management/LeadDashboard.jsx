import React from "react";

function KPI({ label, value }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: "#2563eb", padding: 12 }}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function LeadDashboard({ leads = [] }) {
  const totalLeads = leads.length;
  const advisorLeads = leads.filter((l) => l.leadType === "Advisor Recruitment").length;
  const clientLeads = leads.filter((l) => l.leadType === "Insurance Customer").length;
  const activeClients = leads.filter((l) => l.stage === "Active Client").length;
  const pendingFollowups = leads.filter((l) => l.nextFollowUp).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Lead Management Dashboard</h1>
          <p>Overview of leads, pipeline and activity.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <KPI label="Total Leads" value={totalLeads} />
        <KPI label="Advisor Leads" value={advisorLeads} />
        <KPI label="Client Leads" value={clientLeads} />
        <KPI label="Active Clients" value={activeClients} />
        <KPI label="Pending Follow-ups" value={pendingFollowups} />
      </div>

      <div className="card">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {leads.slice(0, 6).map((l) => (
            <div key={l.id} className="activity-item">
              <div className="activity-dot" style={{ background: "#2563eb" }} />
              <div>
                <strong>{l.name}</strong>
                <p>{l.activities?.[0]?.text || "Activity recorded"}</p>
              </div>
              <span>{l.activities?.[0]?.date || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeadDashboard;
