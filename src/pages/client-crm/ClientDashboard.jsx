import { Link } from "react-router-dom";
import { initialClientLeads } from "../../data/clientCrmData";

const statusColors = {
  Hot: "#dc2626",
  Warm: "#f59e0b",
  Cold: "#2563eb",
  "Proposal Sent": "#7c3aed",
  "KYC Started": "#eab308",
  "Policy Issued": "#16a34a",
  Converted: "#166534",
  Lost: "#dc2626",
};

function SummaryCard({ label, value, accent }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: accent }}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function ClientDashboard({ leads = initialClientLeads }) {
  const totalLeads = leads.length;

  const hotLeads = leads.filter(
    (lead) => lead.leadQuality === "Hot"
  ).length;

  const warmLeads = leads.filter(
    (lead) => lead.leadQuality === "Warm"
  ).length;

  const coldLeads = leads.filter(
    (lead) => lead.leadQuality === "Cold"
  ).length;

  const proposalSent = leads.filter(
    (lead) => lead.proposalSent
  ).length;

  const policyIssued = leads.filter(
    (lead) => lead.policyIssued
  ).length;

  const convertedClients = leads.filter(
    (lead) => lead.finalStatus === "Converted"
  ).length;

  const lostLeads = leads.filter(
    (lead) => lead.finalStatus === "Lost"
  ).length;

  const todaysFollowUps = leads.filter(
    (lead) => lead.nextFollowUpDate === "2026-07-09"
  ).length;

  const overdueFollowUps = leads.filter(
    (lead) => lead.followUpStatus === "Overdue"
  ).length;

  return (
    <div className="client-dashboard">
      <div className="page-header">
        <div>
          <h1>Client CRM Dashboard</h1>
          <p>
            Monitor insurance leads, policy progress, and internal
            follow-up health.
          </p>
        </div>

        <div className="header-summary">
          <Link className="button primary" to="/client-crm/add">
            + Add Lead
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <SummaryCard
          label="Total Leads"
          value={totalLeads}
          accent="#2563eb"
        />

        <SummaryCard
          label="Hot Leads"
          value={hotLeads}
          accent="#dc2626"
        />

        <SummaryCard
          label="Warm Leads"
          value={warmLeads}
          accent="#f59e0b"
        />

        <SummaryCard
          label="Cold Leads"
          value={coldLeads}
          accent="#2563eb"
        />

        <SummaryCard
          label="Proposal Sent"
          value={proposalSent}
          accent="#7c3aed"
        />

        <SummaryCard
          label="Policy Issued"
          value={policyIssued}
          accent="#16a34a"
        />

        <SummaryCard
          label="Converted Clients"
          value={convertedClients}
          accent="#166534"
        />

        <SummaryCard
          label="Lost Leads"
          value={lostLeads}
          accent="#dc2626"
        />

        <SummaryCard
          label="Today's Follow-ups"
          value={todaysFollowUps}
          accent="#0f766e"
        />

        <SummaryCard
          label="Overdue Follow-ups"
          value={overdueFollowUps}
          accent="#ea580c"
        />
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>

            <span
              className="badge"
              style={{ background: "#16a34a" }}
            >
              Fast Access
            </span>
          </div>

          <div className="quick-actions">
            <Link className="action-pill" to="/client-crm/add">
              + Add Lead
            </Link>

            <Link
              className="action-pill"
              to="/client-crm/pipeline"
            >
              View Pipeline
            </Link>

            <Link
              className="action-pill"
              to="/client-crm/followups"
            >
              Today's Follow-ups
            </Link>

            <Link
              className="action-pill"
              to="/client-crm/reports"
            >
              Generate Report
            </Link>
          </div>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>

            <span
              className="badge"
              style={{ background: "#7c3aed" }}
            >
              Live Updates
            </span>
          </div>

          <div className="activity-list">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="activity-item">
                <div
                  className="activity-dot"
                  style={{
                    background:
                      statusColors[lead.finalStatus] || "#64748b",
                  }}
                />

                <div>
                  <strong>{lead.name}</strong>
                  <p>
                    {lead.activity?.[0]?.text ||
                      "Activity logged"}
                  </p>
                </div>

                <span>
                  {lead.activity?.[0]?.time || "Today"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Priority Leads</h3>

            <span
              className="badge"
              style={{ background: "#dc2626" }}
            >
              Hot Queue
            </span>
          </div>

          <div className="activity-list">
            {leads
              .filter((lead) => lead.leadQuality === "Hot")
              .slice(0, 4)
              .map((lead) => (
                <div key={lead.id} className="activity-item">
                  <div
                    className="activity-dot"
                    style={{ background: "#dc2626" }}
                  />

                  <div>
                    <strong>{lead.name}</strong>
                    <p>
                      {lead.policyTypeInterest} • {lead.city}
                    </p>
                  </div>

                  <span>{lead.nextFollowUpDate}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;