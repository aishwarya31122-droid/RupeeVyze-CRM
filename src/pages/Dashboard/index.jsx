import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCrm } from "../../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps } from "../../utils.js";

function Dashboard() {
  const { candidates, pipelineStages } = useCrm();
  const [activeFilter, setActiveFilter] = useState("All");

  const todayFollowUps = useMemo(() => getTodayFollowUps(candidates), [candidates]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(candidates), [candidates]);

  const stageCounts = useMemo(
    () => pipelineStages.map((stage) => ({ stage, count: candidates.filter((candidate) => candidate.stage === stage).length })),
    [candidates, pipelineStages]
  );

  const totalCandidates = candidates.length;
  const documentsSubmitted = candidates.filter((c) => ["Documents Submitted", "Training Completed", "Exam", "Activated", "Dropped"].includes(c.stage)).length;
  const trainingCompleted = candidates.filter((c) => ["Training Completed", "Exam", "Activated"].includes(c.stage)).length;
  const activatedAdvisors = candidates.filter((c) => c.stage === "Activated").length;
  const examResult = candidates.filter((c) => c.examResult === "Passed").length;
  const conversionRate = totalCandidates > 0 ? Math.round((activatedAdvisors / totalCandidates) * 100) : 0;

  const now = new Date();

  const dashboardCards = [
    { key: "All", label: "Total Candidates", value: totalCandidates, accent: "accent-blue" },
    { key: "Documents Submitted", label: "Documents Submitted", value: documentsSubmitted, accent: "accent-green" },
    { key: "Training Completed", label: "Training", value: trainingCompleted, accent: "accent-purple" },
    { key: "Activated", label: "Activated Advisors", value: activatedAdvisors, accent: "accent-blue" },
    { key: "Conversion", label: "Conversion Rate", value: `${conversionRate}%`, accent: "accent-green" },
    { key: "Exam Passed", label: "Exam Result", value: examResult, accent: "accent-orange" },
    { key: "Today", label: "Follow-ups Due Today", value: todayFollowUps.length, accent: "accent-slate" },
    { key: "Overdue", label: "Overdue Follow-ups", value: overdueFollowUps.length, accent: "accent-red" }
  ];

  const filteredCandidates = useMemo(() => {
    if (activeFilter === "All") return candidates;
    if (activeFilter === "Today") return todayFollowUps;
    if (activeFilter === "Overdue") return overdueFollowUps;
    if (activeFilter === "Documents Submitted") return candidates.filter((candidate) => ["Documents Submitted", "Training Completed", "Exam", "Activated", "Dropped"].includes(candidate.stage));
    if (activeFilter === "Training Completed") return candidates.filter((candidate) => ["Training Completed", "Exam", "Activated"].includes(candidate.stage));
    if (activeFilter === "Activated") return candidates.filter((candidate) => candidate.stage === "Activated");
    if (activeFilter === "Conversion") return candidates;
    if (activeFilter === "Exam Passed") return candidates.filter((candidate) => candidate.examResult === "Passed");
    return candidates.filter((candidate) => candidate.stage === activeFilter);
  }, [activeFilter, candidates, todayFollowUps, overdueFollowUps]);

  return (
    <div className="dashboard-container">
      <div className="page-header dashboard-shell">
        <div>
          <h1>RupeeVyze Adviser Recruitment CRM</h1>
          <p>Monitor progress, prioritize follow-ups, and keep recruiter activity moving smoothly.</p>
        </div>
        <div className="dashboard-toolbar">
          <div className="status-pill">
            <strong>{formatDate(now.toISOString())}</strong>
            <span>Current Date</span>
          </div>
          <div className="status-pill">
            <strong>Last updated</strong>
            <span>Just now</span>
          </div>
          <div className="status-pill notification-pill">🔔 3 alerts</div>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-title-row">
          <h2 className="section-title">Recruitment Overview</h2>
          <Link className="text-link" to="/adviser/pipeline">Open pipeline</Link>
        </div>
        <div className="kpi-grid">
          {dashboardCards.map((card) => (
            <button key={card.label} type="button" className={`kpi-card large ${card.accent}`} onClick={() => setActiveFilter(card.key)}>
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{card.value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-title-row">
          <h2 className="section-title">Pipeline Snapshot</h2>
          <span className="section-subtle">{filteredCandidates.length} candidates in view</span>
        </div>
        <div className="stage-grid">
          {stageCounts.map((item) => (
            <div key={item.stage} className="stage-card">
              <div className="stage-header">
                <span className="stage-name">{item.stage}</span>
                <span className="stage-count">{item.count}</span>
              </div>
              <div className="stage-progress-bar">
                <div
                  className="stage-progress-fill"
                  style={{ width: `${(item.count / Math.max(...stageCounts.map((s) => s.count), 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Recruitment Pulse</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📍</div>
            <div className="summary-content">
              <span className="summary-label">Pipeline Count</span>
              <span className="summary-value">{totalCandidates}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <span className="summary-label">Activated</span>
              <span className="summary-value">{activatedAdvisors}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-content">
              <span className="summary-label">Follow-ups Due Today</span>
              <span className="summary-value">{todayFollowUps.length}</span>
            </div>
          </div>
          <div className="summary-card accent-red">
            <div className="summary-icon">⚠️</div>
            <div className="summary-content">
              <span className="summary-label">Overdue Follow-ups</span>
              <span className="summary-value">{overdueFollowUps.length}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
