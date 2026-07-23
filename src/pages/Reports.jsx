import { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
import { useCrm } from "../crmContext.jsx";

const PIE_COLORS = ["#2563eb", "#60a5fa", "#3b82f6", "#1d4ed8", "#0284c7", "#0ea5e9"];
const BAR_COLOR = "#0891b2";
const FUNNEL_COLOR = "#059669";
const LINE_RECRUITED = "#2563eb";
const LINE_ACTIVATED = "#10b981";

function Reports() {
  const { candidates, pipelineStages } = useCrm();

  const advisorRecords = useMemo(() => candidates.filter((c) => c.leadType === "Advisor" || c.leadType === "Recruitment"), [candidates]);
  const totalCandidates = candidates.length;
  const activatedAdvisors = advisorRecords.filter((c) => (c.workflowStage === "Activation" || c.workflowStage === "Business Started") && (c.leadStatus === "Active" || c.leadStatus === "Active Advisor")).length;
  const conversionRate = advisorRecords.length > 0 ? Math.round((activatedAdvisors / advisorRecords.length) * 100) : 0;
  const documentsPending = candidates.filter((c) => (c.documents || []).length > 0).length;

  const sourceAnalysis = useMemo(() => {
    const counts = candidates.reduce((acc, candidate) => {
      const source = candidate.leadSource || candidate.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([source, count]) => ({ name: source, value: count }));
  }, [candidates]);

  const stageDistribution = useMemo(
    () => pipelineStages.map((stage) => ({
      stage,
      count: candidates.filter((candidate) => candidate.workflowStage === stage).length
    })).filter((item) => item.count > 0),
    [candidates, pipelineStages]
  );

  const funnelData = useMemo(
    () => pipelineStages.map((stage) => ({
      name: stage,
      value: candidates.filter((candidate) => candidate.workflowStage === stage).length
    })).filter((item) => item.value > 0),
    [candidates, pipelineStages]
  );

  const monthlyTrend = useMemo(() => {
    const grouped = candidates.reduce((acc, candidate) => {
      const month = (candidate.createdDate || "").slice(0, 7);
      if (!month) return acc;
      if (!acc[month]) acc[month] = { month, recruited: 0, activated: 0 };
      acc[month].recruited += 1;
      if ((candidate.leadType === "Advisor" || candidate.leadType === "Recruitment") && (candidate.workflowStage === "Activation" || candidate.workflowStage === "Business Started") && (candidate.leadStatus === "Active" || candidate.leadStatus === "Active Advisor")) {
        acc[month].activated += 1;
      }
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [candidates]);

  const bestSource = sourceAnalysis.length > 0
    ? sourceAnalysis.reduce((max, item) => (item.value > max.value ? item : max))
    : { name: "N/A", value: 0 };

  const bottleneckStage = stageDistribution.length > 0
    ? stageDistribution.reduce((max, item) => (item.count > max.count ? item : max))
    : { stage: "N/A", count: 0 };

  const followUpRequired = candidates.filter((c) => c.followUp?.status === "Pending" && !["Converted", "Lost"].includes(c.leadStatus)).length;

  const kpis = [
    { label: "Total Candidates", value: totalCandidates, icon: PeopleIcon, color: "#2563eb" },
    { label: "Activated Advisors", value: activatedAdvisors, icon: TrendingUpIcon, color: "#0f766e" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: AssessmentIcon, color: "#d97706" },
    { label: "Documents Pending", value: documentsPending, icon: FactCheckIcon, color: "#7c3aed" }
  ];

  const insights = [
    { label: "Best Source", value: bestSource.name, detail: `${bestSource.value} candidates` },
    { label: "Bottleneck Stage", value: bottleneckStage.stage, detail: `${bottleneckStage.count} candidates stuck` },
    { label: "Activation Rate", value: `${conversionRate}%`, detail: `${activatedAdvisors} of ${totalCandidates} activated` },
    { label: "Needs Follow-up", value: followUpRequired, detail: "Pending actions" }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Reports & Analytics</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Recruitment analytics presented in a consistent enterprise dashboard layout.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ bgcolor: `${card.color}15`, color: card.color, borderRadius: "50%", p: 1 }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Source Analysis</Typography>
            <Box sx={{ height: 280 }}>
              {sourceAnalysis.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceAnalysis} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {sourceAnalysis.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} candidates`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Stage Distribution</Typography>
            <Box sx={{ height: 280 }}>
              {stageDistribution.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recruitment Funnel</Typography>
            <Box sx={{ height: 320 }}>
              {funnelData.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip formatter={(value) => `${value} candidates`} />
                    <Funnel data={funnelData} dataKey="value" stroke={FUNNEL_COLOR} fill={FUNNEL_COLOR} name="Candidates">
                      <LabelList dataKey="value" position="right" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Recruitment Trend</Typography>
            <Box sx={{ height: 320 }}>
              {monthlyTrend.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="recruited" stroke={LINE_RECRUITED} strokeWidth={2} dot={{ fill: LINE_RECRUITED, r: 5 }} name="Recruited" />
                    <Line type="monotone" dataKey="activated" stroke={LINE_ACTIVATED} strokeWidth={2} dot={{ fill: LINE_ACTIVATED, r: 5 }} name="Activated" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {insights.map((item) => (
          <Grid item xs={12} md={6} lg={3} key={item.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                <Typography variant="body2" color="text.secondary">{item.detail}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}

export default Reports;