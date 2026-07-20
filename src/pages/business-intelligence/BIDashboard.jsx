import { useMemo } from "react";
import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Policy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import GavelIcon from "@mui/icons-material/Gavel";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Tooltip,
  XAxis, YAxis, PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList
} from "recharts";
import { useCrm } from "../../crmContext.jsx";

const colors = ["#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626", "#64748b", "#0ea5e9", "#d946ef"];
const FUNNEL_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

function EmptyChart({ text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <Typography variant="body2" color="text.secondary">{text || "No data available"}</Typography>
    </Box>
  );
}

export default function BIDashboard() {
  const { candidates, clients, policies, claims, performanceRecords, activeAdvisors } = useCrm();

  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.finalStatus === "Active Client").length;
    const premium = clients.reduce((sum, c) => sum + Number(c.annualPremiumBudget?.replace(/[^0-9]/g, "") || 0), 0);
    const policyCount = policies.length || clients.reduce((sum, c) => sum + (c.policies || []).length, 0);
    const recruitment = candidates.filter((c) => c.leadType === "Recruitment").length;
    const converted = candidates.filter((c) => c.leadStatus === "Converted" || c.workflowStage === "Active Client").length;
    const conversionRate = candidates.length > 0 ? Math.round((converted / candidates.length) * 100) : 0;

    return {
      revenue: premium,
      policies: policyCount,
      clients: totalClients,
      recruitment,
      conversion: converted,
      conversionRate,
      activeClients,
      totalLeads: candidates.filter((c) => c.leadType !== "Recruitment").length
    };
  }, [candidates, clients, policies]);

  const monthlyTrend = useMemo(() => {
    const grouped = (clients || []).reduce((acc, client) => {
      const month = (client.dateReceived || "").slice(0, 7);
      if (!month) return acc;
      if (!acc[month]) acc[month] = { month, revenue: 0, policies: 0, clients: 0 };
      acc[month].revenue += Number(client.annualPremiumBudget?.replace(/[^0-9]/g, "") || 0);
      acc[month].policies += (client.policies || []).length;
      acc[month].clients += 1;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [clients]);

  const sourceData = useMemo(() => {
    const counts = candidates.reduce((acc, candidate) => {
      const source = candidate.leadSource || candidate.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const recruitmentFunnel = useMemo(() => {
    const stageCounts = candidates.reduce((acc, c) => {
      const stage = c.workflowStage || "Unknown";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [candidates]);

  const salesFunnel = useMemo(() => {
    const advisorLeads = candidates.filter((c) => c.leadType !== "Recruitment");
    const statusCounts = advisorLeads.reduce((acc, c) => {
      const status = c.leadStatus || "Open";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [candidates]);

  const advisorPerformance = useMemo(() => {
    const perfMap = candidates.reduce((acc, c) => {
      const advisor = c.assignedTo || "Unassigned";
      if (!acc[advisor]) acc[advisor] = { name: advisor, total: 0, converted: 0, premium: 0 };
      acc[advisor].total += 1;
      if (c.leadStatus === "Converted" || c.workflowStage === "Active Client") {
        acc[advisor].converted += 1;
      }
      return acc;
    }, {});
    const advisorList = Object.values(perfMap).filter((a) => a.total > 0);
    advisorList.forEach((a) => {
      a.conversionRate = a.total > 0 ? Math.round((a.converted / a.total) * 100) : 0;
    });
    clients.forEach((c) => {
      const advisor = c.advisorAssigned || c.assignedTo || "Unassigned";
      if (perfMap[advisor]) {
        perfMap[advisor].premium += Number(c.annualPremiumBudget?.replace(/[^0-9]/g, "") || 0);
      }
    });
    return advisorList.sort((a, b) => b.converted - a.converted).slice(0, 10);
  }, [candidates, clients]);

  const claimsSummary = useMemo(() => {
    const allClaims = claims.length > 0 ? claims : clients.flatMap((c) => c.claims || []);
    const byStatus = allClaims.reduce((acc, cl) => {
      const status = cl.status || cl.claimStatus || "Pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const totalAmount = allClaims.reduce((sum, cl) => sum + Number(cl.amount || cl.claimAmount || 0), 0);
    return {
      chartData: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      total: allClaims.length,
      totalAmount
    };
  }, [claims, clients]);

  const policySummary = useMemo(() => {
    const allPolicies = policies.length > 0 ? policies : clients.flatMap((c) => c.policies || []);
    const byType = allPolicies.reduce((acc, p) => {
      const type = p.type || p.policyType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const totalPremium = allPolicies.reduce((sum, p) => sum + Number(p.premium || p.annualPremium || 0), 0);
    return {
      chartData: Object.entries(byType).map(([name, value]) => ({ name, value })),
      total: allPolicies.length,
      totalPremium
    };
  }, [policies, clients]);

  const cards = [
    { label: "Revenue", value: `₹${metrics.revenue.toLocaleString("en-IN")}`, icon: AttachMoneyIcon, color: "#2563eb" },
    { label: "Policies", value: metrics.policies, icon: PolicyIcon, color: "#0f766e" },
    { label: "Clients", value: metrics.clients, icon: PeopleIcon, color: "#d97706" },
    { label: "Recruitment", value: metrics.recruitment, icon: TrendingUpIcon, color: "#7c3aed" },
    { label: "Conversion Rate", value: `${metrics.conversionRate}%`, icon: TrendingUpIcon, color: "#16a34a" },
    { label: "Claims", value: claimsSummary.total, icon: GavelIcon, color: "#dc2626" },
    { label: "Active Advisors", value: activeAdvisors.length, icon: SupportAgentIcon, color: "#0ea5e9" },
    { label: "Total Leads", value: metrics.totalLeads, icon: PeopleIcon, color: "#64748b" }
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>BI Dashboard</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Executive view of recruitment, client acquisition and policy revenue health.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {cards.map((card) => {
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
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Trends</Typography>
            <Box sx={{ height: 280 }}>
              {monthlyTrend.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "Revenue" ? `₹${Number(value).toLocaleString("en-IN")}` : value} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="policies" stroke="#16a34a" strokeWidth={2} name="Policies" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Lead Source Analysis</Typography>
            <Box sx={{ height: 280 }}>
              {sourceData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {sourceData.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recruitment Funnel</Typography>
            <Box sx={{ height: 300 }}>
              {recruitmentFunnel.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip formatter={(value) => `${value} candidates`} />
                    <Funnel dataKey="value" data={recruitmentFunnel} stroke="#2563eb" isAnimationActive>
                      <LabelList dataKey="name" position="right" fill="#0f172a" stroke="none" />
                      <LabelList dataKey="value" position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sales Funnel</Typography>
            <Box sx={{ height: 300 }}>
              {salesFunnel.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip formatter={(value) => `${value} leads`} />
                    <Funnel dataKey="value" data={salesFunnel} stroke="#0f766e" isAnimationActive>
                      <LabelList dataKey="name" position="right" fill="#0f172a" stroke="none" />
                      <LabelList dataKey="value" position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Advisor Performance</Typography>
            <Box sx={{ height: 300 }}>
              {advisorPerformance.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advisorPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "Premium" ? `₹${Number(value).toLocaleString("en-IN")}` : value} />
                    <Legend />
                    <Bar dataKey="total" fill="#2563eb" name="Total Leads" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="converted" fill="#16a34a" name="Converted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Claims Summary</Typography>
            <Box sx={{ height: 300 }}>
              {claimsSummary.chartData.length === 0 ? (
                <EmptyChart text="No claims data" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={claimsSummary.chartData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {claimsSummary.chartData.map((entry, index) => (
                        <Cell key={`claim-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} claims`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
            <Stack direction="row" spacing={3} sx={{ mt: 1, pt: 1, borderTop: "1px solid #e2e8f0" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Claims</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{claimsSummary.total}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{claimsSummary.totalAmount.toLocaleString("en-IN")}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Policy Summary</Typography>
            <Box sx={{ height: 280 }}>
              {policySummary.chartData.length === 0 ? (
                <EmptyChart text="No policy data" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={policySummary.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d97706" name="Policies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
            <Stack direction="row" spacing={3} sx={{ mt: 1, pt: 1, borderTop: "1px solid #e2e8f0" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Policies</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{policySummary.total}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Premium</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{policySummary.totalPremium.toLocaleString("en-IN")}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Advisor Conversion Rates</Typography>
            <Box sx={{ height: 280 }}>
              {advisorPerformance.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advisorPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="conversionRate" fill="#7c3aed" name="Conversion %" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
