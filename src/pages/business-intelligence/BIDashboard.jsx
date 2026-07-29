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
import { useAuth } from "../../authContext.jsx";

const colors = ["#2563eb", "#0f766e", "#d97706", "#7c3aed", "#dc2626", "#64748b", "#0ea5e9", "#d946ef"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKey = (d) => d ? `${d.slice(0, 4)}-${d.slice(5, 7)}` : "";
const monthLabel = (mk) => {
  const [, m] = mk.split("-");
  return MONTHS[parseInt(m, 10) - 1] || mk;
};

const insuranceCustomerStages = [
  "New Lead", "Qualified", "Financial Need Analysis", "Product Recommendation",
  "Illustration Shared", "Proposal Submitted", "Medical", "Underwriting",
  "Policy Issued", "Premium Collected", "Active Client"
];

const recruitmentStages = [
  "New Lead", "Qualified", "Interview", "Documents", "NAAF Generated",
  "Training", "Exam", "Code Generated", "Activation", "Dropped"
];

const POLICY_TYPES = ["Term Insurance", "Health Insurance", "ULIP", "Other"];

export default function BIDashboard() {
  const { candidates, clients, policies, claims, performanceRecords, activeAdvisors } = useCrm();
  const { currentUser, isAdmin, isAdvisor } = useAuth();

  const advisorFilteredCandidates = useMemo(() => {
    if (isAdmin || !isAdvisor || !currentUser) return candidates;
    return (candidates || []).filter((c) =>
      String(c.assignedAdvisorId || "") === String(currentUser.id || "")
    );
  }, [candidates, currentUser, isAdmin, isAdvisor]);

  const insuranceLeads = useMemo(() =>
    (advisorFilteredCandidates || []).filter((c) =>
      c.leadType === "Insurance Customer" || !c.leadType
    ), [advisorFilteredCandidates]);

  const activeClientCandidates = useMemo(() =>
    insuranceLeads.filter((c) => c.workflowStage === "Active Client")
  , [insuranceLeads]);

  const advisorLeads = useMemo(() =>
    (advisorFilteredCandidates || []).filter((c) =>
      c.leadType === "Advisor" || c.leadType === "Recruitment"
    ), [advisorFilteredCandidates]);

  const metrics = useMemo(() => {
    const totalActiveClients = activeClientCandidates.length;
    const clientCountViaClients = (clients || []).filter((c) => c.finalStatus === "Active Client").length;
    const uniqueClientCount = Math.max(totalActiveClients, clientCountViaClients);

    const policyCandidates = activeClientCandidates.filter((c) => c.policyNumber);
    const policyContext = (policies || []).filter((p) => p.status === "Active" || p.status === "In Force" || p.status === "Issued");
    const policyFromClients = (clients || []).flatMap((c) => (c.policies || [])).filter((p) => p.status === "Active" || p.status === "In Force" || p.status === "Issued");
    const policyKeys = new Set();
    let totalPolicies = 0;
    policyContext.forEach((p) => { const k = String(p.policyNumber || ""); if (k && !policyKeys.has(k)) { policyKeys.add(k); totalPolicies++; } });
    policyFromClients.forEach((p) => { const k = String(p.policyNumber || ""); if (k && !policyKeys.has(k)) { policyKeys.add(k); totalPolicies++; } });
    policyCandidates.forEach((c) => { const k = String(c.policyNumber || ""); if (k && !policyKeys.has(k)) { policyKeys.add(k); totalPolicies++; } });

    const revenueFromCandidates = activeClientCandidates.reduce((sum, c) => sum + Number(c.premiumAmount || 0), 0);
    const revenueFromPolicies = (policies || []).reduce((sum, p) => sum + Number(p.premium || p.annualPremium || 0), 0);
    const revenueFromClients = (clients || []).reduce((sum, c) => sum + Number(c.annualPremiumBudget?.replace(/[^0-9]/g, "") || 0), 0);
    const totalRevenue = revenueFromCandidates + revenueFromPolicies + revenueFromClients;

    const totalRecruitment = advisorLeads.length;
    const activatedAdvisors = advisorLeads.filter((c) =>
      (c.workflowStage === "Activation" || c.workflowStage === "Business Started") &&
      (c.leadStatus === "Active" || c.leadStatus === "Active Advisor")
    ).length;

    const totalInsuranceLeads = insuranceLeads.length;
    const conversionRate = totalInsuranceLeads > 0
      ? Math.round((totalActiveClients / totalInsuranceLeads) * 100)
      : 0;

    const allClaims = claims.length > 0
      ? claims
      : (clients || []).flatMap((c) => c.claims || []);
    const totalClaims = allClaims.length;

    return {
      revenue: totalRevenue,
      policies: totalPolicies,
      clients: uniqueClientCount,
      recruitment: totalRecruitment,
      conversionRate,
      claims: totalClaims,
      activeAdvisors: activeAdvisors.length,
      totalLeads: (candidates || []).length
    };
  }, [insuranceLeads, activeClientCandidates, advisorLeads, clients, policies, claims, activeAdvisors, candidates]);

  const monthlyTrend = useMemo(() => {
    const grouped = {};

    (candidates || []).forEach((c) => {
      const mk = monthKey(c.createdDate);
      if (!mk) return;
      if (!grouped[mk]) grouped[mk] = { month: mk, leads: 0, clients: 0, policies: 0, revenue: 0 };
      grouped[mk].leads += 1;
      if (c.workflowStage === "Active Client") grouped[mk].clients += 1;
      if (c.policyNumber) grouped[mk].policies += 1;
      if (c.premiumAmount) grouped[mk].revenue += Number(c.premiumAmount);
    });

    (policies || []).forEach((p) => {
      const mk = monthKey(p.issueDate || p.startDate || "");
      if (!mk) return;
      if (!grouped[mk]) grouped[mk] = { month: mk, leads: 0, clients: 0, policies: 0, revenue: 0 };
      grouped[mk].policies += 1;
      grouped[mk].revenue += Number(p.premium || p.annualPremium || 0);
    });

    (clients || []).forEach((c) => {
      const mk = monthKey(c.dateReceived || "");
      if (!mk) return;
      if (!grouped[mk]) grouped[mk] = { month: mk, leads: 0, clients: 0, policies: 0, revenue: 0 };
      grouped[mk].clients += 1;
    });

    return Object.values(grouped)
      .map((d) => ({ ...d, month: monthLabel(d.month) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [candidates, policies, clients]);

  const sourceData = useMemo(() => {
    const counts = (candidates || []).reduce((acc, c) => {
      const source = c.leadSource || c.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const recruitmentFunnel = useMemo(() => {
    const stageOrder = recruitmentStages.reduce((acc, s, i) => { acc[s] = i; return acc; }, {});
    const stageCounts = advisorLeads.reduce((acc, c) => {
      const stage = c.workflowStage || "Unknown";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const ai = stageOrder[a.name] ?? 99;
        const bi = stageOrder[b.name] ?? 99;
        return ai - bi;
      });
  }, [advisorLeads]);

  const salesFunnel = useMemo(() => {
    const stageOrder = insuranceCustomerStages.reduce((acc, s, i) => { acc[s] = i; return acc; }, {});
    const preClient = insuranceLeads.filter((c) => c.workflowStage !== "Active Client");
    const stageCounts = preClient.reduce((acc, c) => {
      const stage = c.workflowStage || "Unknown";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stageCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const ai = stageOrder[a.name] ?? 99;
        const bi = stageOrder[b.name] ?? 99;
        return ai - bi;
      });
  }, [insuranceLeads]);

  const advisorPerformance = useMemo(() => {
    const advisorList = isAdmin || !isAdvisor
      ? activeAdvisors
      : activeAdvisors.filter((a) => String(a.id || "") === String(currentUser?.id || "") || String(a.name || "") === String(currentUser?.name || ""));

    return advisorList.map((advisor) => {
      const advisorName = advisor.name || "";
      const assigned = (candidates || []).filter((c) => {
        const matchesDirect = c.assignedAdvisorName === advisorName || c.assignedTo === advisorName;
        const matchesId = String(c.assignedAdvisorId || "") === String(advisor.id || "");
        return matchesDirect || matchesId;
      });
      const insuranceAssigned = assigned.filter((c) => c.leadType === "Insurance Customer" || !c.leadType);
      const converted = insuranceAssigned.filter((c) => c.workflowStage === "Active Client");
      const withPolicy = insuranceAssigned.filter((c) => c.policyNumber);
      const premiumGen = insuranceAssigned.reduce((sum, c) => sum + Number(c.premiumAmount || 0), 0);

      return {
        name: advisorName,
        total: insuranceAssigned.length,
        converted: converted.length,
        policies: withPolicy.length,
        premium: premiumGen,
        conversionRate: insuranceAssigned.length > 0
          ? Math.round((converted.length / insuranceAssigned.length) * 100)
          : 0
      };
    }).filter((a) => a.total > 0 || a.converted > 0 || a.policies > 0);
  }, [activeAdvisors, candidates, currentUser, isAdmin, isAdvisor]);

  const claimsSummary = useMemo(() => {
    const allClaims = claims.length > 0 ? claims : (clients || []).flatMap((c) => c.claims || []);
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
    const allPolicies = [];

    (policies || []).forEach((p) => allPolicies.push(p));
    (clients || []).forEach((c) => (c.policies || []).forEach((p) => allPolicies.push(p)));
    activeClientCandidates.filter((c) => c.policyNumber).forEach((c) => {
      allPolicies.push({
        policyType: c.policyType || "Other",
        premium: c.premiumAmount || 0,
        policyNumber: c.policyNumber
      });
    });

    const seen = new Set();
    const unique = allPolicies.filter((p) => {
      const k = String(p.policyNumber || "");
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const byType = unique.reduce((acc, p) => {
      let type = p.policyType || p.type || "Other";
      if (!POLICY_TYPES.includes(type)) type = "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    POLICY_TYPES.forEach((t) => { if (!byType[t]) byType[t] = 0; });

    const totalPremium = unique.reduce((sum, p) => sum + Number(p.premium || p.annualPremium || 0), 0);
    return {
      chartData: Object.entries(byType).map(([name, value]) => ({ name, value })),
      total: unique.length,
      totalPremium
    };
  }, [policies, clients, activeClientCandidates]);

  const cards = [
    { label: "Revenue", value: `₹${metrics.revenue.toLocaleString("en-IN")}`, icon: AttachMoneyIcon, color: "#2563eb" },
    { label: "Policies", value: metrics.policies, icon: PolicyIcon, color: "#0f766e" },
    { label: "Clients", value: metrics.clients, icon: PeopleIcon, color: "#d97706" },
    { label: "Recruitment", value: metrics.recruitment, icon: TrendingUpIcon, color: "#7c3aed" },
    { label: "Conversion Rate", value: `${metrics.conversionRate}%`, icon: TrendingUpIcon, color: "#16a34a" },
    { label: "Claims", value: metrics.claims, icon: GavelIcon, color: "#dc2626" },
    { label: "Active Advisors", value: metrics.activeAdvisors, icon: SupportAgentIcon, color: "#0ea5e9" },
    { label: "Total Leads", value: metrics.totalLeads, icon: PeopleIcon, color: "#64748b" }
  ];

  const emptyMsg = "Data will appear once CRM activity starts.";

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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "revenue" ? `₹${Number(value).toLocaleString("en-IN")}` : value} />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#d97706" strokeWidth={2} name="New Leads" />
                    <Line type="monotone" dataKey="clients" stroke="#16a34a" strokeWidth={2} name="Converted Clients" />
                    <Line type="monotone" dataKey="policies" stroke="#2563eb" strokeWidth={2} name="Policies Issued" />
                    <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} name="Revenue Generated" />
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advisorPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "premium" ? `₹${Number(value).toLocaleString("en-IN")}` : value} />
                    <Legend />
                    <Bar dataKey="total" fill="#2563eb" name="Assigned Leads" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="converted" fill="#16a34a" name="Converted Clients" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="policies" fill="#d97706" name="Policies Issued" radius={[4, 4, 0, 0]} />
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">{emptyMsg}</Typography>
                </Box>
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
