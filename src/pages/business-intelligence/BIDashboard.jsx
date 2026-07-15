import { useMemo } from "react";
import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Policy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { useCrm } from "../../crmContext.jsx";

const colors = ["#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626"];

export default function BIDashboard() {
  const { candidates, clients } = useCrm();

  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((client) => client.finalStatus === "Active Client").length;
    const premium = clients.reduce((sum, client) => sum + Number(client.annualPremiumBudget?.replace(/[^0-9]/g, "") || 0), 0);
    const policies = clients.filter((client) => client.policyIssued).length;
    const recruitment = candidates.filter((candidate) => candidate.leadType === "Advisor Recruitment").length;
    const converted = candidates.filter((candidate) => candidate.leadStatus === "Converted" || candidate.workflowStage === "Active Client").length;

    return {
      revenue: premium,
      policies,
      clients: totalClients,
      recruitment,
      premiumValue: premium,
      conversion: converted,
      activeClients
    };
  }, [candidates, clients]);

  const monthlyTrend = useMemo(() => [
    { month: "Jan", revenue: 980000, policies: 18, clients: 12 },
    { month: "Feb", revenue: 1120000, policies: 21, clients: 15 },
    { month: "Mar", revenue: 1260000, policies: 24, clients: 17 },
    { month: "Apr", revenue: 1450000, policies: 27, clients: 21 },
    { month: "May", revenue: 1620000, policies: 31, clients: 24 },
    { month: "Jun", revenue: 1880000, policies: 35, clients: 28 }
  ], []);

  const sourceData = useMemo(() => [
    { name: "Website", value: 14 },
    { name: "Referral", value: 9 },
    { name: "Social Media", value: 6 },
    { name: "Call Center", value: 4 }
  ], []);

  const cards = [
    { label: "Revenue", value: `₹${metrics.revenue.toLocaleString("en-IN")}`, icon: AttachMoneyIcon, color: "#2563eb" },
    { label: "Policies", value: metrics.policies, icon: PolicyIcon, color: "#0f766e" },
    { label: "Clients", value: metrics.clients, icon: PeopleIcon, color: "#d97706" },
    { label: "Recruitment", value: metrics.recruitment, icon: TrendingUpIcon, color: "#7c3aed" }
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
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Lead Source Analysis</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {sourceData.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
