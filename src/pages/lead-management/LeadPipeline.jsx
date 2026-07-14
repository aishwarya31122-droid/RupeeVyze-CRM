import React from "react";

function Column({ title, leads }) {
  return (
    <div style={{ flex: 1, margin: 8 }}>
      <div className="card">
        <h4>{title}</h4>
        <div>
          {leads.map((l) => (
            <div key={l.id} className="activity-item" style={{ marginBottom: 8 }}>
              <div className="activity-dot" style={{ background: "#7c3aed" }} />
              <div>
                <strong>{l.name}</strong>
                <p className="muted-text">{l.leadType} • {l.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadPipeline({ leads = [] }) {
  // Show simplified kanban with key stages
  const stages = ["New Lead", "Qualified", "Financial Need Analysis", "Proposal Submitted", "Underwriting", "Policy Issued", "Active Client"];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Lead Pipeline</h1>
          <p>Kanban-style view across primary client stages (simplified).</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {stages.map((stage) => (
          <Column key={stage} title={stage} leads={leads.filter((l) => l.stage === stage)} />
        ))}
      </div>
    </div>
  );
}

export default LeadPipeline;
