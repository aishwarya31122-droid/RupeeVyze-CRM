import { useMemo, useState } from "react";
import { initialClientLeads } from "../../data/clientCrmData";

function FollowUpTracker({ leads = initialClientLeads, onUpdateLead }) {
  const [activeTab, setActiveTab] = useState("Today's Follow-ups");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab === "Today's Follow-ups") {
        return lead.nextFollowUpDate === "2026-07-09";
      }
      if (activeTab === "Upcoming") {
        return lead.followUpStatus === "Pending" && lead.nextFollowUpDate > "2026-07-09";
      }
      if (activeTab === "Overdue") {
        return lead.followUpStatus === "Overdue";
      }
      if (activeTab === "Completed") {
        return lead.followUpStatus === "Completed";
      }
      return true;
    });
  }, [activeTab, leads]);

  const handleStatus = (lead, status) => {
    const updated = {
      ...lead,
      followUpStatus: status,
      finalStatus: status === "Completed" ? "Follow-up Completed" : status === "Pending" ? "Follow-up Rescheduled" : lead.finalStatus,
      nextFollowUpDate: status === "Pending" ? getNextFollowUpDate(lead.nextFollowUpDate) : lead.nextFollowUpDate
    };
    onUpdateLead?.(updated);
  };

  const getNextFollowUpDate = (dateString) => {
    if (!dateString) return "2026-07-10";

    const parsedDate = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return "2026-07-10";

    parsedDate.setDate(parsedDate.getDate() + 1);
    return parsedDate.toISOString().split("T")[0];
  };

  return (
    <div className="client-followups">
      <div className="page-header">
        <div>
          <h1>Follow-up Tracker</h1>
          <p>Organize follow-ups by today, upcoming, overdue, and completed.</p>
        </div>
      </div>

      <div className="card">
        <div className="tab-row">
          {['Today\'s Follow-ups', 'Upcoming', 'Overdue', 'Completed'].map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div className="followup-list">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="followup-row">
              <div>
                <strong>{lead.name}</strong>
                <p>{lead.mobile}</p>
              </div>
              <div>
                <strong>Advisor</strong>
                <p>{lead.advisorAssigned}</p>
              </div>
              <div>
                <strong>Next Follow-up</strong>
                <p>{lead.nextFollowUpDate}</p>
              </div>
              <div>
                <strong>Priority</strong>
                <p>{lead.leadQuality}</p>
              </div>
              <div>
                <strong>Status</strong>
                <p>{lead.followUpStatus}</p>
              </div>
              <div className="followup-actions">
                <button className="button secondary" onClick={() => handleStatus(lead, "Completed")}>Mark Completed</button>
                <button className="button primary" onClick={() => handleStatus(lead, "Pending")}>Reschedule</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FollowUpTracker;
