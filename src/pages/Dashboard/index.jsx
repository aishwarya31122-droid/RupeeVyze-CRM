import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useCrm } from "../../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps } from "../../utils.js";

function Dashboard() {
  const { candidates, pipelineStages } = useCrm();
  const [activeFilter, setActiveFilter] = useState("All");

  const todayFollowUps = useMemo(() => getTodayFollowUps(candidates), [candidates]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(candidates), [candidates]);

  const stageCounts = useMemo(
    () => pipelineStages.map((stage) => ({ stage, count: candidates.filter((candidate) => candidate.workflowStage === stage).length })),
    [candidates, pipelineStages]
  );

  const totalCandidates = candidates.length;
  const documentsSubmitted = candidates.filter((c) => (c.documents || []).length > 0).length;
  const trainingCompleted = candidates.filter((c) => ["Training", "Exam", "Active Client", "Policy Issued"].includes(c.workflowStage)).length;
  const activatedAdvisors = candidates.filter((c) => c.leadStatus === "Converted" || c.workflowStage === "Active Client").length;
  const examResult = candidates.filter((c) => c.workflowStage === "Exam").length;
  const conversionRate = totalCandidates > 0 ? Math.round((activatedAdvisors / totalCandidates) * 100) : 0;

  const now = new Date();

  const dashboardCards = [
    { key: "All", label: "Total Candidates", value: totalCandidates, icon: GroupIcon, color: "#2563eb" },
    { key: "Documents Submitted", label: "Documents Submitted", value: documentsSubmitted, icon: FactCheckIcon, color: "#0f766e" },
    { key: "Training Completed", label: "Training", value: trainingCompleted, icon: AssignmentTurnedInIcon, color: "#7c3aed" },
    { key: "Activated", label: "Activated Advisors", value: activatedAdvisors, icon: TrendingUpIcon, color: "#16a34a" },
    { key: "Conversion", label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUpIcon, color: "#d97706" },
    { key: "Exam Passed", label: "Exam Result", value: examResult, icon: EventNoteIcon, color: "#dc2626" },
    { key: "Today", label: "Follow-ups Due Today", value: todayFollowUps.length, icon: EventNoteIcon, color: "#475569" },
    { key: "Overdue", label: "Overdue Follow-ups", value: overdueFollowUps.length, icon: FactCheckIcon, color: "#b91c1c" }
  ];

  const filteredCandidates = useMemo(() => {
    if (activeFilter === "All") return candidates;
    if (activeFilter === "Today") return todayFollowUps;
    if (activeFilter === "Overdue") return overdueFollowUps;
    if (activeFilter === "Documents Submitted") return candidates.filter((candidate) => (candidate.documents || []).length > 0);
    if (activeFilter === "Training Completed") return candidates.filter((candidate) => ["Training", "Exam", "Active Client", "Policy Issued"].includes(candidate.workflowStage));
    if (activeFilter === "Activated") return candidates.filter((candidate) => candidate.leadStatus === "Converted" || candidate.workflowStage === "Active Client");
    if (activeFilter === "Conversion") return candidates;
    if (activeFilter === "Exam Passed") return candidates.filter((candidate) => candidate.workflowStage === "Exam");
    return candidates.filter((candidate) => candidate.workflowStage === activeFilter);
  }, [activeFilter, candidates, todayFollowUps, overdueFollowUps]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>RupeeVyze Adviser Recruitment CRM</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>Monitor progress, prioritize follow-ups, and keep recruiter activity moving smoothly.</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Chip label={formatDate(now.toISOString())} color="primary" variant="outlined" />
          <Chip label="Last updated: just now" color="default" />
          {overdueFollowUps.length > 0 && <Chip label={`${overdueFollowUps.length} alert${overdueFollowUps.length !== 1 ? "s" : ""}`} color="warning" />}
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Recruitment Overview</Typography>
          <Button component={Link} to="/adviser/lead-management/pipeline" variant="outlined">Open pipeline</Button>
        </Box>
        <Grid container spacing={2}>
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={card.label}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%", cursor: "pointer" }} onClick={() => setActiveFilter(card.key)}>
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
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Pipeline Snapshot</Typography>
          <Typography variant="body2" color="text.secondary">{filteredCandidates.length} candidates in view</Typography>
        </Box>
        <Grid container spacing={2}>
          {stageCounts.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.stage}>
              <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.stage}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.count}</Typography>
                </Box>
                <Box sx={{ width: "100%", height: 8, borderRadius: 999, bgcolor: "#e2e8f0" }}>
                  <Box sx={{ width: `${(item.count / Math.max(...stageCounts.map((s) => s.count), 1)) * 100}%`, height: "100%", bgcolor: "#2563eb", borderRadius: 999 }} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recruitment Pulse</Typography>
        <Grid container spacing={2}>
          {[
            { label: "Pipeline Count", value: totalCandidates },
            { label: "Activated", value: activatedAdvisors },
            { label: "Follow-ups Due Today", value: todayFollowUps.length },
            { label: "Overdue Follow-ups", value: overdueFollowUps.length }
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Box sx={{ borderRadius: 2, border: "1px solid #e2e8f0", p: 2, bgcolor: item.label.includes("Overdue") ? "#fef2f2" : "#f8fafc" }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

export default Dashboard;
