import { useMemo } from "react";
import { useCrm } from "../../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps } from "../../utils.js";

function Dashboard() {
  const { candidates, pipelineStages, settings, selectedConfig } = useCrm();

  const todayFollowUps = useMemo(() => getTodayFollowUps(candidates), [candidates]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(candidates), [candidates]);

  const stageCounts = useMemo(
    () => pipelineStages.map((stage) => ({ stage, count: candidates.filter((candidate) => candidate.stage === stage).length })),
    [candidates, pipelineStages]
  );

  // Recruitment Funnel Overview Metrics
  const totalCandidates = candidates.length;
  const documentsSubmitted = candidates.filter((c) => ["Documents Submitted", "Training Completed", "Exam", "Activated", "Dropped"].includes(c.stage)).length;
  const trainingCompleted = candidates.filter((c) => ["Training Completed", "Exam", "Activated"].includes(c.stage)).length;
  const activatedAdvisors = candidates.filter((c) => c.stage === "Activated").length;
  const conversionRate = totalCandidates > 0 ? Math.round((activatedAdvisors / totalCandidates) * 100) : 0;

  // Adviser Performance Dummy Data
  const adviserPerformance = {
    activeAdvisers: activatedAdvisors,
    policiesSold: activatedAdvisors * 12,
    premiumCollected: activatedAdvisors * 125000,
    persistency: 92,
    overrideEarned: activatedAdvisors * 8500
  };

  // Last refreshed time
  const now = new Date();

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>RupeeVyze Adviser Recrutiment</p>
        </div>
        <div className="header-summary">
          <div>
            <strong>{formatDate(now.toISOString())}</strong>
            <p>Updated just now</p>
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Recruitment Funnel Overview</h2>
        <div className="kpi-grid">
          <div className="kpi-card large">
            <span className="kpi-label">Total Candidates</span>
            <span className="kpi-value">{totalCandidates}</span>
            <span className="kpi-icon"></span>
          </div>
          <div className="kpi-card large">
            <span className="kpi-label">Documents Submitted</span>
            <span className="kpi-value">{documentsSubmitted}</span>
            <span className="kpi-icon"></span>
          </div>
          <div className="kpi-card large">
            <span className="kpi-label">Training Completed</span>
            <span className="kpi-value">{trainingCompleted}</span>
            <span className="kpi-icon"></span>
          </div>
          <div className="kpi-card large accent-blue">
            <span className="kpi-label">Activated Advisors</span>
            <span className="kpi-value">{activatedAdvisors}</span>
            <span className="kpi-icon"></span>
          </div>
          <div className="kpi-card large accent-green">
            <span className="kpi-label">Conversion Rate</span>
            <span className="kpi-value">{conversionRate}%</span>
            <span className="kpi-icon"></span>
          </div>
        </div>
      </section>

      {/* Recruitment Stage Breakdown */}
      <section className="dashboard-section">
        <h2 className="section-title">Stage Breakdown</h2>
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
                  style={{ width: `${(item.count / Math.max(...stageCounts.map(s => s.count), 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Adviser Performance */}
      <section className="dashboard-section">
        <h2 className="section-title">Adviser Performance</h2>
        <div className="performance-grid">
          <div className="performance-card">
            <span className="perf-label">Active Advisers</span>
            <span className="perf-value">{adviserPerformance.activeAdvisers}</span>
          </div>
          <div className="performance-card">
            <span className="perf-label">Policies Sold</span>
            <span className="perf-value">{adviserPerformance.policiesSold}</span>
          </div>
          <div className="performance-card">
            <span className="perf-label">Premium Collected</span>
            <span className="perf-value">₹ {(adviserPerformance.premiumCollected / 100000).toFixed(1)}L</span>
          </div>
          <div className="performance-card">
            <span className="perf-label">Persistency %</span>
            <span className="perf-value">{adviserPerformance.persistency}%</span>
          </div>
          <div className="performance-card">
            <span className="perf-label">Override Earned</span>
            <span className="perf-value">₹ {(adviserPerformance.overrideEarned / 100000).toFixed(1)}L</span>
          </div>
        </div>
      </section>

      {/* Combined Summary */}
      <section className="dashboard-section">
        <h2 className="section-title">Combined Summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon"></div>
            <div className="summary-content">
              <span className="summary-label">Pipeline Count</span>
              <span className="summary-value">{totalCandidates}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"></div>
            <div className="summary-content">
              <span className="summary-label">Activated</span>
              <span className="summary-value">{activatedAdvisors}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⌚</div>
            <div className="summary-content">
              <span className="summary-label">Follow-ups Due Today</span>
              <span className="summary-value">{todayFollowUps.length}</span>
            </div>
          </div>
          <div className="summary-card accent-red">
            <div className="summary-icon">●</div>
            <div className="summary-content">
              <span className="summary-label">Overdue Follow-ups</span>
              <span className="summary-value">{overdueFollowUps.length}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon"></div>
            <div className="summary-content">
              <span className="summary-label">Last Refreshed</span>
              <span className="summary-value">Just now</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
