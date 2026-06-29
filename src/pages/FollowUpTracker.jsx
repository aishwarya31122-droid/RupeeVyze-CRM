import { useMemo, useState, useCallback } from "react";
import { useCrm } from "../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps, sortByPriority } from "../utils.js";

const tabs = ["Today", "Overdue", "Completed"];

function FollowUpTracker() {
  const { candidates, markFollowUpDone } = useCrm();
  const [activeTab, setActiveTab] = useState("Today");
  const [markedDone, setMarkedDone] = useState(new Set());

  const todayList = useMemo(() => sortByPriority(getTodayFollowUps(candidates)), [candidates]);
  const overdueList = useMemo(() => sortByPriority(getOverdueFollowUps(candidates)), [candidates]);
  const completedList = useMemo(
    () => sortByPriority(candidates.filter((candidate) => candidate.followUp?.status === "Done")),
    [candidates]
  );

  const currentList = activeTab === "Today" ? todayList : activeTab === "Overdue" ? overdueList : completedList;

  const handleMarkDone = useCallback((candidateId) => {
    markFollowUpDone(candidateId);
    setMarkedDone((prev) => new Set(prev).add(candidateId));
    setTimeout(() => {
      setMarkedDone((prev) => {
        const updated = new Set(prev);
        updated.delete(candidateId);
        return updated;
      });
    }, 500);
  }, [markFollowUpDone]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Follow-up Tracker</h1>
          <p>Prioritize calls, message candidates, and complete follow-ups.</p>
        </div>
      </div>

      <div className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="followup-table">
        {currentList.length > 0 ? (
          currentList.map((candidate) => (
            <div key={candidate.id} className="followup-row">
              <div>
                <h3>{candidate.name}</h3>
                <p>{candidate.phone} · {candidate.stage}</p>
                <p>{candidate.followUp.type} · {candidate.followUp.priority}</p>
              </div>
              <div className="followup-actions">
                <button className="secondary">Call</button>
                <button className="secondary">WhatsApp</button>
                {activeTab !== "Completed" && (
                  <button
                    className={`primary ${markedDone.has(candidate.id) ? "done" : ""}`}
                    onClick={() => handleMarkDone(candidate.id)}
                    disabled={markedDone.has(candidate.id)}
                  >
                    {markedDone.has(candidate.id) ? "Marked Done" : "Mark as Done"}
                  </button>
                )}
                {activeTab === "Completed" && (
                  <span className="completed-badge">Completed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
            No follow-ups in this category
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowUpTracker;