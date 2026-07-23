import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PolicyIcon from "@mui/icons-material/Policy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useCrm } from "../../crmContext.jsx";

const colors = ["#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626", "#64748b"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(date);
};

function Business() {
  const { candidates, performanceRecords, activeAdvisors } = useCrm();

  const advisorLeads = useMemo(() => candidates.filter((candidate) => (candidate.leadType === "Advisor" || candidate.leadType === "Recruitment") && candidate.workflowStage !== "Dropped"), [candidates]);
  const activePerformanceRecords = useMemo(
    () => (performanceRecords || []).filter((record) => activeAdvisors.some((advisor) => advisor.advisorCode === record.advisorCode || advisor.name === record.advisorName)),
    [activeAdvisors, performanceRecords]
  );

  const businessMetrics = useMemo(() => {
    const totalPremium = activePerformanceRecords.reduce((sum, record) => sum + Number(record.premiumCollected || 0), 0);
    const totalPolicies = activePerformanceRecords.reduce((sum, record) => sum + Number(record.policiesSold || 0), 0);

    const sortedByMonth = [...activePerformanceRecords].sort((a, b) => a.month.localeCompare(b.month));
    const latestMonth = sortedByMonth.length > 0 ? sortedByMonth[sortedByMonth.length - 1].month : "";
    const monthlyPremium = activePerformanceRecords.filter((r) => r.month === latestMonth).reduce((sum, r) => sum + Number(r.premiumCollected || 0), 0);
    const monthlyPolicies = activePerformanceRecords.filter((r) => r.month === latestMonth).reduce((sum, r) => sum + Number(r.policiesSold || 0), 0);

    const productivity = activeAdvisors.length ? totalPolicies / activeAdvisors.length : 0;

    const topRecruiters = advisorLeads.reduce((acc, lead) => {
      acc[lead.assignedTo] = (acc[lead.assignedTo] || 0) + 1;
      return acc;
    }, {});
    const sortedRecruiters = Object.entries(topRecruiters).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const advisorRanking = activeAdvisors
      .map((advisor) => ({
        name: advisor.name,
        premium: Number(advisor.premiumCollected || 0),
        policies: Number(advisor.policiesSold || 0),
        months: activePerformanceRecords.filter((record) => record.advisorName === advisor.name || record.advisorCode === advisor.advisorCode).length
      }))
      .sort((a, b) => b.premium - a.premium)
      .slice(0, 6);

    const months = [...new Set(activePerformanceRecords.map((r) => r.month))].sort();
    let monthlyGrowth = 0;
    if (months.length >= 2) {
      const currentMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];
      const currentPremium = activePerformanceRecords.filter((r) => r.month === currentMonth).reduce((sum, r) => sum + Number(r.premiumCollected || 0), 0);
      const previousPremium = activePerformanceRecords.filter((r) => r.month === previousMonth).reduce((sum, r) => sum + Number(r.premiumCollected || 0), 0);
      monthlyGrowth = previousPremium > 0 ? ((currentPremium - previousPremium) / previousPremium) * 100 : 0;
    }

    return {
      totalPremium,
      totalPolicies,
      monthlyPremium,
      monthlyPolicies,
      productivity,
      sortedRecruiters,
      advisorRanking,
      monthlyGrowth,
      conversionRate: advisorLeads.length ? (activeAdvisors.length / advisorLeads.length) * 100 : 0,
      activeAdvisorCount: activeAdvisors.length,
      totalRecruitmentLeads: advisorLeads.length
    };
  }, [activeAdvisors, activePerformanceRecords, advisorLeads, performanceRecords]);

  const revenueChartData = useMemo(() => {
    const grouped = activePerformanceRecords.reduce((acc, record) => {
      acc[record.month] = (acc[record.month] || 0) + Number(record.premiumCollected || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([month, premium]) => ({ month: formatMonth(month), rawMonth: month, premium })).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));
  }, [activePerformanceRecords]);

  const premiumDistribution = useMemo(() => {
    return businessMetrics.advisorRanking.map((a) => ({ name: a.name, value: a.premium }));
  }, [businessMetrics.advisorRanking]);

  const policyDistribution = useMemo(() => {
    return businessMetrics.advisorRanking.map((a) => ({ name: a.name, value: a.policies }));
  }, [businessMetrics.advisorRanking]);

  const activationData = useMemo(() => [
    { name: "Recruitment Leads", value: businessMetrics.totalRecruitmentLeads },
    { name: "Activated Advisors", value: businessMetrics.activeAdvisorCount }
  ], [businessMetrics]);

  const growthData = useMemo(() => {
    const months = [...new Set(activePerformanceRecords.map((r) => r.month))].sort();
    return months.map((month) => {
      const monthRecords = activePerformanceRecords.filter((r) => r.month === month);
      return {
        month: formatMonth(month),
        rawMonth: month,
        premium: monthRecords.reduce((sum, r) => sum + Number(r.premiumCollected || 0), 0),
        policies: monthRecords.reduce((sum, r) => sum + Number(r.policiesSold || 0), 0)
      };
    });
  }, [performanceRecords]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Business Dashboard</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Business performance indicators derived from advisor recruitment, activation and performance data.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {[
          { label: "Total Premium", value: formatCurrency(businessMetrics.totalPremium), icon: AttachMoneyIcon, color: "#2563eb" },
          { label: "Total Policies", value: businessMetrics.totalPolicies, icon: PolicyIcon, color: "#0f766e" },
          { label: "Monthly Revenue", value: formatCurrency(businessMetrics.monthlyPremium), icon: TrendingUpIcon, color: "#d97706" },
          { label: "Advisor Productivity", value: `${businessMetrics.productivity.toFixed(1)} policies/advisor`, icon: PeopleIcon, color: "#7c3aed" },
          { label: "Monthly Growth", value: `${businessMetrics.monthlyGrowth >= 0 ? "+" : ""}${businessMetrics.monthlyGrowth.toFixed(1)}%`, icon: ShowChartIcon, color: businessMetrics.monthlyGrowth >= 0 ? "#16a34a" : "#dc2626" },
          { label: "Conversion Rate", value: `${businessMetrics.conversionRate.toFixed(1)}%`, icon: StarIcon, color: "#9333ea" }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={card.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
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
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Revenue Chart</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="premium" fill="#2563eb" name="Premium" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recruitment vs Activation</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activationData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {activationData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Premium Distribution</Typography>
            <Box sx={{ height: 260 }}>
              {premiumDistribution.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={premiumDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#0f766e" name="Premium" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Policy Distribution</Typography>
            <Box sx={{ height: 260 }}>
              {policyDistribution.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={policyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d97706" name="Policies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Growth</Typography>
            <Box sx={{ height: 260 }}>
              {growthData.length === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="premium" stroke="#2563eb" strokeWidth={2} name="Premium" />
                    <Line type="monotone" dataKey="policies" stroke="#0f766e" strokeWidth={2} name="Policies" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Recruiters</Typography>
            <Stack spacing={1.5}>
              {businessMetrics.sortedRecruiters.map(([name, count], index) => (
                <Box key={name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.2, borderRadius: 2, bgcolor: index === 0 ? "#eff6ff" : "#f8fafc" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip label={`#${index + 1}`} size="small" color={index === 0 ? "primary" : "default"} sx={{ minWidth: 36 }} />
                    <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                  </Box>
                  <Chip label={`${count} leads`} size="small" variant="outlined" />
                </Box>
              ))}
              {businessMetrics.sortedRecruiters.length === 0 && (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="body2" color="text.secondary">No recruiter data available</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top Advisors</Typography>
            <Stack spacing={1.5}>
              {businessMetrics.advisorRanking.map((advisor, index) => (
                <Box key={advisor.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.2, borderRadius: 2, bgcolor: index === 0 ? "#eff6ff" : "#f8fafc" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip label={`#${index + 1}`} size="small" color={index === 0 ? "primary" : "default"} sx={{ minWidth: 36 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{advisor.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{advisor.policies} policies • {advisor.months} month{advisor.months !== 1 ? "s" : ""}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(advisor.premium)}</Typography>
                </Box>
              ))}
              {businessMetrics.advisorRanking.length === 0 && (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="body2" color="text.secondary">No advisor data available</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Business Summary</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Advisor</TableCell>
                    <TableCell>Policies</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Avg/Month</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessMetrics.advisorRanking.map((row) => (
                    <TableRow key={row.name} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      </TableCell>
                      <TableCell>{row.policies}</TableCell>
                      <TableCell>{formatCurrency(row.premium)}</TableCell>
                      <TableCell>{formatCurrency(row.months > 0 ? row.premium / row.months : 0)}</TableCell>
                    </TableRow>
                  ))}
                  {businessMetrics.advisorRanking.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Box sx={{ textAlign: "center", py: 2 }}>
                          <Typography variant="body2" color="text.secondary">No data available</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Business;
