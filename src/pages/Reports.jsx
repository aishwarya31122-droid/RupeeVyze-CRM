import { useMemo } from "react";
import { useCrm } from "../crmContext.jsx";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";

const PIE_COLORS = ["#2563eb", "#60a5fa", "#3b82f6", "#1d4ed8", "#0284c7", "#0ea5e9"];
const BAR_COLOR = "#0891b2";
const FUNNEL_COLOR = "#059669";
const LINE_RECRUITED = "#2563eb";
const LINE_ACTIVATED = "#10b981";

function Reports() {
  const { candidates, pipelineStages } = useCrm();

  // KPI Calculations
  const totalCandidates = candidates.length;
  const activatedAdvisors = candidates.filter((c) => c.stage === "Activated").length;
  const conversionRate = totalCandidates > 0 ? Math.round((activatedAdvisors / totalCandidates) * 100) : 0;
  const documentsPending = candidates.filter((c) => ["Sourced", "Contacted"].includes(c.stage)).length;

  // Source Analysis
  const sourceAnalysis = useMemo(() => {
    const counts = candidates.reduce((acc, candidate) => {
      acc[candidate.source] = (acc[candidate.source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([source, count]) => ({ name: source, value: count }));
  }, [candidates]);

  // Stage Distribution
  const stageDistribution = useMemo(
    () => pipelineStages.map((stage) => ({
      stage,
      count: candidates.filter((candidate) => candidate.stage === stage).length
    })).filter(item => item.count > 0),
    [candidates, pipelineStages]
  );

  // Funnel Data
  const funnelData = useMemo(
    () => pipelineStages.map((stage) => ({
      name: stage,
      value: candidates.filter((candidate) => candidate.stage === stage).length
    })).filter(item => item.value > 0),
    [candidates, pipelineStages]
  );

  // Monthly Recruitment Trend (Dummy Data)
  const monthlyTrend = [
    { month: "Jan", recruited: 12, activated: 3 },
    { month: "Feb", recruited: 18, activated: 5 },
    { month: "Mar", recruited: 15, activated: 4 },
    { month: "Apr", recruited: 22, activated: 8 },
    { month: "May", recruited: 28, activated: 10 },
    { month: "Jun", recruited: 32, activated: 12 }
  ];

  // Key Insights
  const bestSource = sourceAnalysis.length > 0 
    ? sourceAnalysis.reduce((max, item) => item.value > max.value ? item : max)
    : { name: "N/A", value: 0 };

  const bottleneckStage = stageDistribution.length > 0
    ? stageDistribution.reduce((max, item) => item.count > max.count ? item : max)
    : { stage: "N/A", count: 0 };

  const followUpRequired = candidates.filter((c) => 
    c.followUp.status === "Pending" && !["Activated", "Dropped"].includes(c.stage)
  ).length;

  return (
    <div className="reports-container">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Comprehensive recruitment analytics and performance metrics.</p>
        </div>
      </div>

      {/* KPI Cards Section */}
      <section className="analytics-section">
        <h2 className="section-title">Key Performance Indicators</h2>
        <div className="kpi-grid">
          <div className="kpi-card large">
            <span className="kpi-label">Total Candidates</span>
            <span className="kpi-value">{totalCandidates}</span>
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
          <div className="kpi-card large">
            <span className="kpi-label">Documents Pending</span>
            <span className="kpi-value">{documentsPending}</span>
            <span className="kpi-icon"></span>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="analytics-section">
        <h2 className="section-title">Analytics Overview</h2>
        <div className="charts-grid">
          {/* Source Analysis Pie Chart */}
          <div className="chart-card">
            <h3>Source Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#2563eb"
                  dataKey="value"
                >
                  {sourceAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} candidates`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Distribution Bar Chart */}
          <div className="chart-card">
            <h3>Stage Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stageDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={140} />
                <Tooltip />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Funnel Chart */}
      <section className="analytics-section">
        <h2 className="section-title">Recruitment Funnel</h2>
        <div className="chart-card full-width">
          <ResponsiveContainer width="100%" height={350}>
            <FunnelChart>
              <Tooltip formatter={(value) => `${value} candidates`} />
              <Funnel
                data={funnelData}
                dataKey="value"
                stroke={FUNNEL_COLOR}
                fill={FUNNEL_COLOR}
                name="Candidates"
              >
                <LabelList dataKey="value" position="right" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Trend Chart */}
      <section className="analytics-section">
        <h2 className="section-title">Monthly Recruitment Trend</h2>
        <div className="chart-card full-width">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyTrend}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="recruited"
                stroke={LINE_RECRUITED}
                strokeWidth={2}
                dot={{ fill: LINE_RECRUITED, r: 5 }}
                name="Recruited"
              />
              <Line
                type="monotone"
                dataKey="activated"
                stroke={LINE_ACTIVATED}
                strokeWidth={2}
                dot={{ fill: LINE_ACTIVATED, r: 5 }}
                name="Activated"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Key Insights */}
      <section className="analytics-section">
        <h2 className="section-title">Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon"></div>
            <div className="insight-content">
              <span className="insight-label">Best Recruitment Source</span>
              <span className="insight-value">{bestSource.name}</span>
              <span className="insight-detail">{bestSource.value} candidates</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon"></div>
            <div className="insight-content">
              <span className="insight-label">Current Bottleneck Stage</span>
              <span className="insight-value">{bottleneckStage.stage}</span>
              <span className="insight-detail">{bottleneckStage.count} candidates stuck</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon"></div>
            <div className="insight-content">
              <span className="insight-label">Total Activation Rate</span>
              <span className="insight-value">{conversionRate}%</span>
              <span className="insight-detail">{activatedAdvisors} of {totalCandidates} activated</span>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon"></div>
            <div className="insight-content">
              <span className="insight-label">Candidates Requiring Follow-up</span>
              <span className="insight-value">{followUpRequired}</span>
              <span className="insight-detail">Pending actions</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;