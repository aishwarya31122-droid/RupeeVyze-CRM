import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GroupIcon from "@mui/icons-material/Group";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InboxIcon from "@mui/icons-material/Inbox";
import { useCrm } from "../../crmContext.jsx";
import { useNavigate } from "react-router-dom";
import { getActiveAdvisorRows } from "./advisorOperationsData.js";
import FunnelChart from "../../components/FunnelChart.jsx";
import CandidateForm from "../../components/CandidateForm.jsx";

const stageColor = {
  "New Lead": "#4f46e5",
  "First Contact": "#0ea5e9",
  "Interested": "#f59e0b",
  "KYC Pending": "#a855f7",
  "Training": "#0284c7",
  "Exam": "#f59e0b",
  "Active Client": "#16a34a",
  "Activated": "#0f766e"
};

function EmptyState({ icon: Icon, title, description }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, textAlign: "center" }}>
      <Box sx={{ bgcolor: "#f1f5f9", borderRadius: "50%", p: 2, mb: 2 }}>
        <Icon sx={{ fontSize: 32, color: "#94a3b8" }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#334155" }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
    </Box>
  );
}

function Recruitment() {
  const { candidates, addCandidate, performanceRecords } = useCrm();
  const navigate = useNavigate();
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const advisorLeads = useMemo(
    () => candidates.filter((candidate) => candidate.leadType === "Advisor Recruitment"),
    [candidates]
  );
  const activeAdvisors = useMemo(() => getActiveAdvisorRows(candidates, performanceRecords), [candidates, performanceRecords]);

  const stageCounts = useMemo(
    () => [
      { stage: "New Lead", count: advisorLeads.filter((l) => l.workflowStage === "New Lead").length },
      { stage: "First Contact", count: advisorLeads.filter((l) => l.workflowStage === "First Contact").length },
      { stage: "Interested", count: advisorLeads.filter((l) => l.workflowStage === "Interested").length },
      { stage: "KYC Pending", count: advisorLeads.filter((l) => l.workflowStage === "KYC Pending").length },
      { stage: "Training", count: advisorLeads.filter((l) => l.workflowStage === "Training").length },
      { stage: "Exam", count: advisorLeads.filter((l) => l.workflowStage === "Exam").length },
      { stage: "Active Client", count: advisorLeads.filter((l) => l.workflowStage === "Active Client").length }
    ],
    [advisorLeads]
  );

  const metrics = useMemo(() => {
    const activatedAdvisors = advisorLeads.filter((lead) => lead.workflowStage === "Active Client" || lead.leadStatus === "Converted").length;
    const newLeads = advisorLeads.filter((lead) => ["New Lead", "Interested"].includes(lead.workflowStage)).length;
    const kycPending = advisorLeads.filter((lead) => lead.workflowStage === "KYC Pending").length;
    const trainingInProgress = advisorLeads.filter((lead) => lead.workflowStage === "Training").length;
    const examPending = advisorLeads.filter((lead) => lead.workflowStage === "Exam").length;
    const codePending = advisorLeads.filter((lead) => ["Code Generation", "KYC Complete"].includes(lead.workflowStage)).length;
    const businessStarted = activeAdvisors.filter((advisor) => Number(advisor.policiesSold || 0) > 0).length;

    return [
      { label: "Total Advisor Leads", value: advisorLeads.length, icon: GroupIcon, color: "#2563eb" },
      { label: "New Leads", value: newLeads, icon: AddIcon, color: "#0f766e" },
      { label: "KYC Pending", value: kycPending, icon: FactCheckIcon, color: "#d97706" },
      { label: "Training In Progress", value: trainingInProgress, icon: AssignmentTurnedInIcon, color: "#7c3aed" },
      { label: "Exam Pending", value: examPending, icon: EventNoteIcon, color: "#dc2626" },
      { label: "Code Generation Pending", value: codePending, icon: PlaylistAddCheckIcon, color: "#475569" },
      { label: "Activated Advisors", value: activatedAdvisors, icon: TrendingUpIcon, color: "#16a34a" },
      { label: "Business Started", value: businessStarted, icon: GroupIcon, color: "#9333ea" }
    ];
  }, [activeAdvisors, advisorLeads, performanceRecords]);

  const recentLeads = useMemo(() =>
    [...advisorLeads].sort((a, b) => (b.createdDate || "").localeCompare(a.createdDate || "")).slice(0, 5),
    [advisorLeads]
  );

  const upcomingFollowUps = useMemo(() =>
    [...advisorLeads]
      .filter((lead) => lead.nextFollowUp)
      .sort((a, b) => (a.nextFollowUp || "").localeCompare(b.nextFollowUp || ""))
      .slice(0, 5),
    [advisorLeads]
  );

  const pendingDocuments = useMemo(() =>
    advisorLeads.filter((lead) => lead.workflowStage !== "Active Client" && lead.leadStatus !== "Converted").slice(0, 5),
    [advisorLeads]
  );

  const pendingExams = useMemo(() =>
    advisorLeads.filter((lead) => lead.workflowStage === "Exam").slice(0, 5),
    [advisorLeads]
  );

  const recentActivities = useMemo(() =>
    advisorLeads
      .flatMap((lead) => (lead.activities || []).slice(0, 1).map((activity) => ({
        leadName: lead.name,
        leadId: lead.id,
        text: `${activity.type}: ${activity.text}`,
        date: activity.date,
        stage: lead.workflowStage
      })))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 8),
    [advisorLeads]
  );

  const handleAddLead = (lead) => {
    addCandidate({
      ...lead,
      leadId: lead.leadId || `LD-${1000 + candidates.length + 1}`,
      workflowStage: lead.workflowStage || "New Lead",
      leadStatus: lead.leadStatus || "Open",
      leadType: lead.leadType || "Advisor Recruitment",
      leadSource: lead.leadSource || lead.source || "Referral",
      source: lead.source || lead.leadSource || "Referral"
    });
    setAddLeadOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Recruitment Dashboard</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>
            Track advisor sourcing, onboarding readiness, and activation progress from the live recruitment pipeline.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setAddLeadOpen(true)}>
          Add Advisor Lead
        </Button>
      </Box>

      <Grid container spacing={2}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ bgcolor: `${metric.color}15`, color: metric.color, borderRadius: "50%", p: 1 }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{metric.value}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Advisor Leads</Typography>
            {recentLeads.length === 0 ? (
              <EmptyState icon={InboxIcon} title="No leads yet" description="New advisor leads will appear here." />
            ) : (
              <List dense>
                {recentLeads.map((lead) => (
                  <ListItem key={lead.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stageColor[lead.workflowStage] || "#94a3b8" }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={lead.name}
                      secondary={
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary">{lead.city}</Typography>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Chip label={lead.workflowStage} size="small" sx={{ height: 18, fontSize: 10, bgcolor: `${stageColor[lead.workflowStage] || "#94a3b8"}15`, color: stageColor[lead.workflowStage] || "#94a3b8" }} />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Upcoming Follow-ups</Typography>
            {upcomingFollowUps.length === 0 ? (
              <EmptyState icon={EventNoteIcon} title="No follow-ups" description="Scheduled follow-ups will appear here." />
            ) : (
              <List dense>
                {upcomingFollowUps.map((lead) => (
                  <ListItem key={lead.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563eb" }} />
                    </ListItemAvatar>
                    <ListItemText primary={lead.name} secondary={lead.nextFollowUp} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending Documents</Typography>
            {pendingDocuments.length === 0 ? (
              <EmptyState icon={FactCheckIcon} title="All clear" description="No pending documents at this time." />
            ) : (
              <List dense>
                {pendingDocuments.map((lead) => (
                  <ListItem key={lead.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#d97706" }} />
                    </ListItemAvatar>
                    <ListItemText primary={lead.name} secondary={lead.workflowStage} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2, minHeight: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending Exams</Typography>
            {pendingExams.length === 0 ? (
              <EmptyState icon={FactCheckIcon} title="No pending exams" description="All advisors have cleared exams." />
            ) : (
              <List dense>
                {pendingExams.map((lead) => (
                  <ListItem key={lead.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#dc2626" }} />
                    </ListItemAvatar>
                    <ListItemText primary={lead.name} secondary={`Follow-up: ${lead.nextFollowUp}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Activities</Typography>
        {recentActivities.length === 0 ? (
          <EmptyState icon={AssignmentTurnedInIcon} title="No recent activity" description="Activities from advisor leads will appear here." />
        ) : (
          <Stack spacing={1}>
            {recentActivities.map((activity, index) => (
              <Box key={`${activity.leadId}-${index}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stageColor[activity.stage] || "#94a3b8", flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{activity.leadName}</Typography>
                    <Typography variant="caption" color="text.secondary">{activity.text}</Typography>
                  </Box>
                </Box>
                <Chip label={activity.date} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <CandidateForm
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onAdd={handleAddLead}
      />
    </Box>
  );
}

export default Recruitment;
