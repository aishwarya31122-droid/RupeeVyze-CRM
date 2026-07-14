import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const tabs = ["Overview", "Timeline", "Activities", "Documents", "Communication", "Tasks", "Notes", "History", "Conversion"];

function LeadDetails({ leads = [], onUpdate }) {
  const { id } = useParams();
  const lead = useMemo(() => leads.find((l) => l.id === id) || leads[0], [id, leads]);
  const [active, setActive] = useState("Overview");

  if (!lead) return <div className="card">No lead found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{lead.name}</h1>
          <p>{lead.leadType} • {lead.city}</p>
        </div>
      </div>

      <div className="tab-row">
        {tabs.map((t) => (
          <button key={t} className={`tab-btn ${active === t ? "active" : ""}`} onClick={() => setActive(t)}>{t}</button>
        ))}
      </div>

      {active === "Overview" && (
        <div className="card detail-card">
          <h3>Overview</h3>
          <div className="detail-grid-stack">
            <div className="detail-item"><span>Lead ID</span><strong>{lead.leadId}</strong></div>
            <div className="detail-item"><span>Type</span><strong>{lead.leadType}</strong></div>
            <div className="detail-item"><span>Assigned To</span><strong>{lead.assignedTo}</strong></div>
            <div className="detail-item"><span>Stage</span><strong>{lead.stage}</strong></div>
            <div className="detail-item"><span>Next Follow-up</span><strong>{lead.nextFollowUp}</strong></div>
            <div className="detail-item"><span>Notes</span><strong>{lead.notes}</strong></div>
          </div>
        </div>
      )}

      {active === "Timeline" && (
        <div className="card">
          <h3>Timeline</h3>
          <div className="timeline">
            {lead.timeline.map((t, i) => (
              <div key={`${t.stage}-${i}`} className={`timeline-step`}>
                <span>{t.stage} — {t.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Activities" && (
        <div className="card">
          <h3>Activities</h3>
          <div className="activity-list">
            {lead.activities.map((a, i) => (
              <div key={`${a.type}-${i}`} className="activity-item">
                <div className="activity-dot" style={{ background: "#2563eb" }} />
                <div>
                  <strong>{a.type}</strong>
                  <p>{a.text}</p>
                </div>
                <span>{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Documents" && (
        <div className="card">
          <h3>Documents</h3>
          <div className="attachment-grid">
            {lead.documents.map((d, i) => (
              <div className="attachment-card" key={i}><span className="attachment-icon">📄</span><strong>{d}</strong></div>
            ))}
          </div>
        </div>
      )}

      {active === "Communication" && (
        <div className="card">
          <h3>Communication</h3>
          <div className="activity-list">
            {lead.communication.map((c, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{ background: "#10b981" }} />
                <div>
                  <strong>{c.type}</strong>
                  <p>{c.remarks}</p>
                </div>
                <span>{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Tasks" && (
        <div className="card">
          <h3>Tasks</h3>
          <div className="activity-list">
            {lead.tasks.map((t) => (
              <div key={t.id} className="activity-item">
                <div className="activity-dot" style={{ background: "#f59e0b" }} />
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.assignedTo} • Due {t.dueDate}</p>
                </div>
                <span>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default LeadDetails;
