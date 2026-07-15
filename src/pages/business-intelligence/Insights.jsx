import { useMemo } from "react";
import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import { useCrm } from "../../crmContext.jsx";

export default function Insights() {
  const { candidates, clients, pipelineStages } = useCrm();

  const insights = useMemo(() => {
    const converted = candidates.filter((candidate) => candidate.leadStatus === "Converted" || candidate.workflowStage === "Active Client").length;
    const pendingFollowUps = candidates.filter((candidate) => candidate.followUp?.status === "Pending" && !["Converted", "Lost"].includes(candidate.leadStatus)).length;
    const overdueTasks = candidates.reduce((sum, candidate) => sum + (candidate.tasks || []).filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done").length, 0);
    const activeClients = clients.filter((client) => client.finalStatus === "Active Client").length;
    const hotLeads = clients.filter((client) => client.leadQuality === "Hot").length;

    const sourceCounts = candidates.reduce((acc, candidate) => {
      const source = candidate.leadSource || candidate.source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    const bestLeadSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];

    const advisorPerformance = candidates.reduce((acc, candidate) => {
      const advisor = candidate.assignedTo || candidate.advisorAssigned || "Unassigned";
      acc[advisor] = (acc[advisor] || 0) + (candidate.leadStatus === "Converted" || candidate.workflowStage === "Active Client" ? 1 : 0);
      return acc;
    }, {});
    const highestPerformingAdvisor = Object.entries(advisorPerformance).sort((a, b) => b[1] - a[1])[0] || ["Unassigned", 0];

    const stageCounts = pipelineStages
      .map((stage) => ({ stage, count: candidates.filter((candidate) => candidate.workflowStage === stage).length }))
      .filter((item) => item.count > 0);
    const lowestConversionStage = stageCounts.reduce((lowest, item) => (item.count > lowest.count ? item : lowest), { stage: "N/A", count: 0 });
    const bottleneckStage = stageCounts.reduce((bottleneck, item) => (item.count > bottleneck.count ? item : bottleneck), { stage: "N/A", count: 0 });

    const monthlyCounts = candidates.reduce((acc, candidate) => {
      const month = (candidate.createdDate || "").slice(0, 7);
      if (month) acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const monthKeys = Object.keys(monthlyCounts).sort();
    const currentMonthCount = monthKeys.length ? monthlyCounts[monthKeys[monthKeys.length - 1]] || 0 : 0;
    const previousMonthCount = monthKeys.length > 1 ? monthlyCounts[monthKeys[monthKeys.length - 2]] || 0 : currentMonthCount;
    const monthlyGrowth = previousMonthCount ? Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100) : 0;

    const clientGrowth = clients.reduce((acc, client) => {
      const month = (client.dateReceived || "").slice(0, 7);
      if (month) acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const clientMonthKeys = Object.keys(clientGrowth).sort();
    const currentClientCount = clientMonthKeys.length ? clientGrowth[clientMonthKeys[clientMonthKeys.length - 1]] || 0 : 0;

    const policyTrend = clients.reduce((sum, client) => sum + (client.policies || []).length, 0);

    return [
      { title: "Best Lead Source", value: bestLeadSource[0], detail: `${bestLeadSource[1]} leads captured` },
      { title: "Highest Performing Advisor", value: highestPerformingAdvisor[0], detail: `${highestPerformingAdvisor[1]} conversions` },
      { title: "Lowest Conversion Stage", value: lowestConversionStage.stage, detail: `${lowestConversionStage.count} leads in motion` },
      { title: "Pending Follow-ups", value: `${pendingFollowUps} items`, detail: "Priority attention required" },
      { title: "Overdue Tasks", value: `${overdueTasks} tasks`, detail: "Escalate to keep momentum" },
      { title: "Monthly Growth", value: `${monthlyGrowth}%`, detail: `${currentMonthCount} vs ${previousMonthCount} last month` },
      { title: "Recruitment Bottleneck", value: bottleneckStage.stage, detail: `${bottleneckStage.count} leads waiting` },
      { title: "Client Growth", value: `${currentClientCount} clients`, detail: `${activeClients} active clients` },
      { title: "Policy Trend", value: `${policyTrend} policies`, detail: `${hotLeads} hot prospects` }
    ];
  }, [candidates, clients, pipelineStages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Business Insights</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Executive recommendations and operational signals drawn from live CRM activity.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {insights.map((insight) => (
          <Grid item xs={12} md={6} lg={4} key={insight.title}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1 }}>
                    <InsightsIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{insight.title}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{insight.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{insight.detail}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recommended Actions</Typography>
        <Stack spacing={1.5}>
          {[
            "Prioritize overdue follow-ups for warm leads.",
            "Escalate pending policy reviews for active clients.",
            "Re-engage inactive prospects with renewal offers.",
            "Use top-performing recruiters for the next campaign."
          ].map((item) => (
            <Box key={item} sx={{ p: 1.25, borderRadius: 2, bgcolor: "#f8fafc" }}>{item}</Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
