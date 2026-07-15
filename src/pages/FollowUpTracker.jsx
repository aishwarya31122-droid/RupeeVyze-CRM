import { useMemo, useState, useCallback } from "react";
import { useCrm } from "../crmContext.jsx";
import { formatDate, getFollowUpDate, getTodayFollowUps, getOverdueFollowUps, sortByPriority } from "../utils.js";

const tabs = ["Today", "Overdue", "Upcoming", "Completed"];

function FollowUpTracker({ items, onMarkDone }) {
  const { candidates, markFollowUpDone } = useCrm();
  const sourceItems = items ?? candidates;
  const markDoneHandler = onMarkDone ?? markFollowUpDone;
  const [activeTab, setActiveTab] = useState("Today");
  const [markedDone, setMarkedDone] = useState(new Set());
  const [priorityFilter, setPriorityFilter] = useState("All");

  const todayList = useMemo(() => sortByPriority(getTodayFollowUps(sourceItems)), [sourceItems]);
  const overdueList = useMemo(() => sortByPriority(getOverdueFollowUps(sourceItems)), [sourceItems]);
  const upcomingList = useMemo(
    () => sortByPriority(sourceItems.filter((candidate) => getFollowUpDate(candidate) && !getOverdueFollowUps([candidate]).length && !getTodayFollowUps([candidate]).length)),
    [sourceItems]
  );
  const completedList = useMemo(
    () => sortByPriority(sourceItems.filter((candidate) => candidate.followUp?.status === "Done")),
    [sourceItems]
  );

  const currentList = useMemo(() => {
    const source = activeTab === "Today" ? todayList : activeTab === "Overdue" ? overdueList : activeTab === "Upcoming" ? upcomingList : completedList;
    if (priorityFilter === "All") return source;
    return source.filter((candidate) => candidate.followUp.priority === priorityFilter);
  }, [activeTab, todayList, overdueList, upcomingList, completedList, priorityFilter]);

  const handleMarkDone = useCallback((candidateId) => {
    markDoneHandler(candidateId);
    setMarkedDone((prev) => new Set(prev).add(candidateId));
    setTimeout(() => {
      setMarkedDone((prev) => {
        const updated = new Set(prev);
        updated.delete(candidateId);
        return updated;
      });
    }, 500);
  }, [markDoneHandler]);

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
                <p>{candidate.mobile || candidate.phone} · {candidate.workflowStage}</p>
                <p>{candidate.followUp?.type ?? "Follow-up"} · {candidate.followUp?.priority ?? "Medium"}</p>
                <p className="muted-text">Due: {formatDate(getFollowUpDate(candidate))}</p>
              </div>
              <div className="followup-actions">
                <span className={`status-pill compact ${String(candidate.followUp?.priority || "Medium").toLowerCase()}`}>{candidate.followUp?.priority || "Medium"}</span>
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