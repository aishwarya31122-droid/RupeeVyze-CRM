import { useMemo } from "react";
import { useCrm } from "../crmContext.jsx";

function Dashboard() {
  const { candidates, pipelineStages, selectedConfig, settings } = useCrm();

  const totals = useMemo(() => {
    const stageCounts = pipelineStages.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    candidates.forEach((candidate) => {
      if (stageCounts[candidate.workflowStage] !== undefined) {
        stageCounts[candidate.workflowStage] += 1;
      }
    });

    const overdueFollowUps = candidates.filter((candidate) => {
      const followUpDate = candidate.nextFollowUp || candidate.followUpDate;
      if (!followUpDate) return false;
      const due = new Date(followUpDate);
      return due < new Date();
    }).length;

    return {
      total: candidates.length,
      activated: stageCounts["Active Client"] || 0,
      trainingCompleted: stageCounts["Training"] || 0,
      examPassed: stageCounts["Exam"] || 0,
      overdueFollowUps,
      stageCounts
    };
  }, [candidates, pipelineStages]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{settings.businessName} • {selectedConfig.name} workflow</p>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total Candidates</h3>
          <h2>{totals.total}</h2>
        </div>
        <div className="card">
          <h3>Training Completed</h3>
          <h2>{totals.trainingCompleted}</h2>
        </div>
        <div className="card">
          <h3>Exam Passed</h3>
          <h2>{totals.examPassed}</h2>
        </div>
        <div className="card">
          <h3>Activated Advisors</h3>
          <h2>{totals.activated}</h2>
        </div>
        <div className="card">
          <h3>Overdue Follow-ups</h3>
          <h2>{totals.overdueFollowUps}</h2>
        </div>
      </div>

      <div className="stage-summary">
        {pipelineStages.map((stage) => (
          <div key={stage} className="summary-bar">
            <span>{stage}</span>
            <strong>{totals.stageCounts[stage] || 0}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;