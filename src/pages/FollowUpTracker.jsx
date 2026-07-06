import { useMemo, useState, useCallback } from "react";
import { useCrm } from "../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps, sortByPriority } from "../utils.js";

const tabs = ["Today", "Overdue", "Upcoming", "Completed"];

function FollowUpTracker() {
  const { candidates, markFollowUpDone } = useCrm();
  const [activeTab, setActiveTab] = useState("Today");
  const [markedDone, setMarkedDone] = useState(new Set());
  const [priorityFilter, setPriorityFilter] = useState("All");

  const todayList = useMemo(() => sortByPriority(getTodayFollowUps(candidates)), [candidates]);
  const overdueList = useMemo(() => sortByPriority(getOverdueFollowUps(candidates)), [candidates]);
  const upcomingList = useMemo(
    () => sortByPriority(candidates.filter((candidate) => candidate.followUpDate && !getOverdueFollowUps([candidate]).length && !getTodayFollowUps([candidate]).length)),
    [candidates]
  );
  const completedList = useMemo(
    () => sortByPriority(candidates.filter((candidate) => candidate.followUp?.status === "Done")),
    [candidates]
  );

  const currentList = useMemo(() => {
    const source = activeTab === "Today" ? todayList : activeTab === "Overdue" ? overdueList : activeTab === "Upcoming" ? upcomingList : completedList;
    if (priorityFilter === "All") return source;
    return source.filter((candidate) => candidate.followUp.priority === priorityFilter);
  }, [activeTab, todayList, overdueList, upcomingList, completedList, priorityFilter]);

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

      <div className="followup-toolbar">
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
        <select className="filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="followup-table">
        {currentList.length > 0 ? (
          currentList.map((candidate) => (
            <div key={candidate.id} className="followup-row">
              <div>
                <h3>{candidate.name}</h3>
                <p>{candidate.phone} · {candidate.stage}</p>
                <p>{candidate.followUp.type} · {candidate.followUp.priority}</p>
                <p className="muted-text">Due: {formatDate(candidate.followUpDate)}</p>
              </div>
              <div className="followup-actions">
                <span className={`status-pill compact ${candidate.followUp.priority.toLowerCase()}`}>{candidate.followUp.priority}</span>
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
          <div className="empty-state">
            No follow-ups in this category
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowUpTracker;