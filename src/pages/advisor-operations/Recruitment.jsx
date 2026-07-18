import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
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
import FunnelChart from "../../components/FunnelChart.jsx";

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
  const { candidates, addCandidate, performanceRecords, activeAdvisors, stageBadge, advisorWorkflowStages, sources } = useCrm();
  const navigate = useNavigate();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [advisorErrors, setAdvisorErrors] = useState({});

  const emptyAdvisorForm = () => ({
    name: "",
    mobile: "",
    email: "",
    city: "",
    qualification: "",
    source: "",
    workflowStage: "Interview",
    followUpDate: "",
    documentsSubmittedToTata: "",
    documentSubmissionDate: "",
    naafStatus: "",
    naafGenerationDate: "",
    trainingStatus: "",
    trainingCompletionDate: "",
    examDate: "",
    examResult: "",
    advisorCode: "",
    codeGenerationStatus: "",
    codeIssueDate: "",
    activationStatus: "",
    activationDate: "",
    dropReason: "",
    notes: ""
  });

  const [advisorForm, setAdvisorForm] = useState(emptyAdvisorForm);

  useEffect(() => {
    if (!addLeadOpen) {
      setAdvisorForm(emptyAdvisorForm());
      setAdvisorErrors({});
    }
  }, [addLeadOpen]);

  const handleAdvisorField = (e) => {
    const { name, value } = e.target;
    setAdvisorForm((prev) => ({ ...prev, [name]: value }));
    if (advisorErrors[name]) {
      setAdvisorErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleStageChange = (e) => {
    const newStage = e.target.value;
    setAdvisorForm((prev) => ({ ...prev, workflowStage: newStage }));
    if (advisorErrors.workflowStage) {
      setAdvisorErrors((prev) => ({ ...prev, workflowStage: "" }));
    }
  };

  const stageFields = useMemo(() => {
    const stage = advisorForm.workflowStage;
    switch (stage) {
      case "Interview":
        return { followUpDate: true, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
      case "Documents":
        return { followUpDate: false, documentsSubmittedToTata: true, documentSubmissionDate: advisorForm.documentsSubmittedToTata === "Submitted", naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
      case "NAAF Generation":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: true, naafGenerationDate: advisorForm.naafStatus === "Generated", trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
      case "Training":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: true, trainingCompletionDate: advisorForm.trainingStatus === "Completed", examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
      case "Exam":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: true, examResult: true, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
      case "Code Generation":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: true, codeGenerationStatus: true, codeIssueDate: advisorForm.codeGenerationStatus === "Generated", activationStatus: false, activationDate: false, dropReason: false };
      case "Activation":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: true, activationDate: advisorForm.activationStatus === "Activated", dropReason: false };
      case "Dropped":
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: true };
      default:
        return { followUpDate: false, documentsSubmittedToTata: false, documentSubmissionDate: false, naafStatus: false, naafGenerationDate: false, trainingStatus: false, trainingCompletionDate: false, examDate: false, examResult: false, advisorCode: false, codeGenerationStatus: false, codeIssueDate: false, activationStatus: false, activationDate: false, dropReason: false };
    }
  }, [advisorForm.workflowStage, advisorForm.documentsSubmittedToTata, advisorForm.naafStatus, advisorForm.trainingStatus, advisorForm.codeGenerationStatus, advisorForm.activationStatus]);

  const submitAdvisor = () => {
    const errs = {};
    if (!advisorForm.name.trim()) errs.name = "Full Name is required";
    if (!advisorForm.mobile.trim()) errs.mobile = "Mobile Number is required";
    if (!advisorForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(advisorForm.email)) errs.email = "Invalid email";
    if (!advisorForm.city.trim()) errs.city = "City is required";
    if (!advisorForm.source) errs.source = "Source is required";
    if (!advisorForm.workflowStage) errs.workflowStage = "Workflow Stage is required";
    setAdvisorErrors(errs);
    if (Object.keys(errs).length > 0) return;

    handleAddLead({
      ...advisorForm,
      leadType: "Advisor Recruitment",
      leadId: `LD-${1000 + candidates.length + 1}`,
      leadStatus: "Open",
      leadSource: advisorForm.source,
    });
  };

  const advisorLeads = useMemo(
    () => candidates.filter((candidate) => candidate.leadType === "Advisor Recruitment"),
    [candidates]
  );

  const stageCounts = useMemo(
    () => advisorWorkflowStages.map((stage) => ({
      stage,
      count: advisorLeads.filter((l) => l.workflowStage === stage).length
    })).filter((item) => item.count > 0),
    [advisorLeads, advisorWorkflowStages]
  );

  const metrics = useMemo(() => {
    const activationPending = advisorLeads.filter((lead) => lead.workflowStage === "Activation").length;
    const interviewStage = advisorLeads.filter((lead) => lead.workflowStage === "Interview").length;
    const documentsStage = advisorLeads.filter((lead) => lead.workflowStage === "Documents").length;
    const trainingInProgress = advisorLeads.filter((lead) => lead.workflowStage === "Training").length;
    const examPending = advisorLeads.filter((lead) => lead.workflowStage === "Exam").length;
    const codeGenPending = advisorLeads.filter((lead) => lead.workflowStage === "Code Generation").length;
    const dropped = advisorLeads.filter((lead) => lead.workflowStage === "Dropped").length;
    const businessStarted = activeAdvisors.filter((advisor) => Number(advisor.policiesSold || 0) > 0).length;

    return [
      { label: "Total Advisors", value: advisorLeads.length, icon: GroupIcon, color: "#2563eb" },
      { label: "Interview", value: interviewStage, icon: AddIcon, color: "#0ea5e9" },
      { label: "Documents", value: documentsStage, icon: FactCheckIcon, color: "#f97316" },
      { label: "Training", value: trainingInProgress, icon: AssignmentTurnedInIcon, color: "#0284c7" },
      { label: "Exam", value: examPending, icon: EventNoteIcon, color: "#f59e0b" },
      { label: "Code Generation", value: codeGenPending, icon: PlaylistAddCheckIcon, color: "#22c55e" },
      { label: "Activation", value: activationPending, icon: TrendingUpIcon, color: "#16a34a" },
      { label: "Dropped", value: dropped, icon: InboxIcon, color: "#ef4444" }
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
      workflowStage: lead.workflowStage || "Interview",
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
          Add Advisor
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Advisors</Typography>
            {recentLeads.length === 0 ? (
              <EmptyState icon={InboxIcon} title="No advisors yet" description="New advisors will appear here." />
            ) : (
              <List dense>
                {recentLeads.map((lead) => (
                  <ListItem key={lead.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stageBadge[lead.workflowStage] || "#94a3b8" }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={lead.name}
                      secondary={
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary">{lead.city}</Typography>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Chip label={lead.workflowStage} size="small" sx={{ height: 18, fontSize: 10, bgcolor: `${stageBadge[lead.workflowStage] || "#94a3b8"}15`, color: stageBadge[lead.workflowStage] || "#94a3b8" }} />
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
          <EmptyState icon={AssignmentTurnedInIcon} title="No recent activity" description="Activities from advisors will appear here." />
        ) : (
          <Stack spacing={1}>
            {recentActivities.map((activity, index) => (
              <Box key={`${activity.leadId}-${index}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stageBadge[activity.stage] || "#94a3b8", flexShrink: 0 }} />
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

      <Dialog open={addLeadOpen} onClose={() => setAddLeadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Advisor</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Full Name" name="name" value={advisorForm.name} onChange={handleAdvisorField} error={!!advisorErrors.name} helperText={advisorErrors.name} />
          <TextField fullWidth margin="dense" label="Mobile Number" name="mobile" value={advisorForm.mobile} onChange={handleAdvisorField} error={!!advisorErrors.mobile} helperText={advisorErrors.mobile} />
          <TextField fullWidth margin="dense" label="Email" name="email" type="email" value={advisorForm.email} onChange={handleAdvisorField} error={!!advisorErrors.email} helperText={advisorErrors.email} />
          <TextField fullWidth margin="dense" label="City" name="city" value={advisorForm.city} onChange={handleAdvisorField} error={!!advisorErrors.city} helperText={advisorErrors.city} />
          <TextField fullWidth margin="dense" label="Qualification" name="qualification" value={advisorForm.qualification} onChange={handleAdvisorField} />
          <TextField select fullWidth margin="dense" label="Recruitment Source" name="source" value={advisorForm.source} onChange={handleAdvisorField} error={!!advisorErrors.source} helperText={advisorErrors.source}>
            {sources.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth margin="dense" label="Recruitment Stage" name="workflowStage" value={advisorForm.workflowStage} onChange={handleStageChange} error={!!advisorErrors.workflowStage} helperText={advisorErrors.workflowStage}>
            {advisorWorkflowStages.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          {stageFields.followUpDate && (
            <TextField fullWidth margin="dense" label="Follow-up Date" name="followUpDate" type="date" value={advisorForm.followUpDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.documentsSubmittedToTata && (
            <TextField select fullWidth margin="dense" label="Documents Submitted to TATA Team" name="documentsSubmittedToTata" value={advisorForm.documentsSubmittedToTata} onChange={handleAdvisorField}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Submitted">Submitted</MenuItem>
            </TextField>
          )}
          {stageFields.documentSubmissionDate && (
            <TextField fullWidth margin="dense" label="Document Submission Date" name="documentSubmissionDate" type="date" value={advisorForm.documentSubmissionDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.naafStatus && (
            <TextField select fullWidth margin="dense" label="NAAF Status" name="naafStatus" value={advisorForm.naafStatus} onChange={handleAdvisorField}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Generated">Generated</MenuItem>
            </TextField>
          )}
          {stageFields.naafGenerationDate && (
            <TextField fullWidth margin="dense" label="NAAF Generation Date" name="naafGenerationDate" type="date" value={advisorForm.naafGenerationDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.trainingStatus && (
            <TextField select fullWidth margin="dense" label="25 Hrs Training Status" name="trainingStatus" value={advisorForm.trainingStatus} onChange={handleAdvisorField}>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          )}
          {stageFields.trainingCompletionDate && (
            <TextField fullWidth margin="dense" label="Date of 25 Hrs Training Completion" name="trainingCompletionDate" type="date" value={advisorForm.trainingCompletionDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.examDate && (
            <TextField fullWidth margin="dense" label="Date of Exam" name="examDate" type="date" value={advisorForm.examDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.examResult && (
            <TextField select fullWidth margin="dense" label="Exam Result" name="examResult" value={advisorForm.examResult} onChange={handleAdvisorField}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Passed">Passed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>
          )}
          {stageFields.advisorCode && (
            <TextField fullWidth margin="dense" label="Tata AIA Advisor Code" name="advisorCode" value={advisorForm.advisorCode} onChange={handleAdvisorField} />
          )}
          {stageFields.codeGenerationStatus && (
            <TextField select fullWidth margin="dense" label="Code Generation Status" name="codeGenerationStatus" value={advisorForm.codeGenerationStatus} onChange={handleAdvisorField}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Generated">Generated</MenuItem>
            </TextField>
          )}
          {stageFields.codeIssueDate && (
            <TextField fullWidth margin="dense" label="Code Issue Date" name="codeIssueDate" type="date" value={advisorForm.codeIssueDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.activationStatus && (
            <TextField select fullWidth margin="dense" label="Activation Status" name="activationStatus" value={advisorForm.activationStatus} onChange={handleAdvisorField}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Activated">Activated</MenuItem>
            </TextField>
          )}
          {stageFields.activationDate && (
            <TextField fullWidth margin="dense" label="Activation Date (First Policy Login)" name="activationDate" type="date" value={advisorForm.activationDate} onChange={handleAdvisorField} InputLabelProps={{ shrink: true }} />
          )}
          {stageFields.dropReason && (
            <TextField fullWidth margin="dense" label="Drop Reason" name="dropReason" value={advisorForm.dropReason} onChange={handleAdvisorField} multiline rows={2} />
          )}
          <TextField fullWidth margin="dense" label="Notes" name="notes" value={advisorForm.notes} onChange={handleAdvisorField} multiline rows={3} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLeadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitAdvisor}>Save Advisor</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Recruitment;
