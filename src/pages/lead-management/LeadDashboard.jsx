import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Paper, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import FunnelChart from "../../components/FunnelChart.jsx";
import CandidateForm from "../../components/CandidateForm.jsx";
import { useCrm } from "../../crmContext.jsx";
import { formatDate, getTodayFollowUps, getOverdueFollowUps } from "../../utils.js";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PriorityHighOutlinedIcon from "@mui/icons-material/PriorityHighOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

const insuranceFunnelStages = ["New Lead", "Contacted", "Follow-up", "Need Analysis", "Proposal Shared", "Policy Discussion", "Policy Issued", "Lost"];
const advisorFunnelStages = ["Interview", "Documents", "NAAF Generation", "Training", "Exam", "Code Generation", "Activation", "Dropped"];

function KPI({ label, value, icon: Icon, color }) {
  return (
    <Card
      className="kpi-card"
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        height: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 32px rgba(15, 23, 42, 0.1)" }
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ bgcolor: `${color}18`, color, borderRadius: "50%", p: 1.1, display: "flex" }}>
            <Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>{value}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LeadDashboard() {
  const navigate = useNavigate();
  const { candidates, addCandidate } = useCrm();
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const leads = useMemo(() => candidates.filter((c) => !c.leadType || c.leadType === "Insurance Customer"), [candidates]);
  const advisorCandidates = useMemo(() => candidates.filter((c) => c.leadType === "Advisor"), [candidates]);

  const totalLeads = leads.length;
  const advisorLeads = advisorCandidates.length;
  const customerLeads = leads.length;
  const openLeads = leads.filter((l) => l.leadStatus === "Open").length;
  const assignedLeads = leads.filter((l) => l.leadStatus === "Assigned").length;
  const convertedLeads = leads.filter((l) => l.leadStatus === "Converted").length;

  const todaysNewLeads = useMemo(
    () => leads.filter((lead) => formatDate(lead.createdDate) === formatDate(new Date())).length,
    [leads]
  );

  const todaysFollowUps = useMemo(() => getTodayFollowUps(leads).length, [leads]);
  const overdueFollowUps = useMemo(() => getOverdueFollowUps(leads).length, [leads]);
  const upcomingTasks = useMemo(
    () => leads.reduce((sum, lead) => sum + (lead.tasks?.filter((task) => new Date(task.dueDate) > new Date()).length || 0), 0),
    [leads]
  );

  const priorityLeads = leads.filter((lead) => lead.priority === "High" || lead.followUp?.priority === "High").length;

  const advisorFunnelData = useMemo(() => {
    return advisorFunnelStages.map((stage) => ({ stage, count: advisorCandidates.filter((lead) => lead.workflowStage === stage).length }));
  }, [advisorCandidates]);

  const insuranceFunnelData = useMemo(() => {
    return insuranceFunnelStages.map((stage) => ({ stage, count: leads.filter((lead) => lead.workflowStage === stage).length }));
  }, [leads]);

  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const kpiCards = [
    { label: "Total Leads", value: totalLeads, icon: PeopleAltOutlinedIcon, color: "#2563eb" },
    { label: "Advisor Leads", value: advisorLeads, icon: GroupsOutlinedIcon, color: "#0f766e" },
    { label: "Insurance Leads", value: customerLeads, icon: ShieldOutlinedIcon, color: "#7c3aed" },
    { label: "Open Leads", value: openLeads, icon: AssignmentLateOutlinedIcon, color: "#d97706" },
    { label: "Assigned Leads", value: assignedLeads, icon: PersonOutlineOutlinedIcon, color: "#475569" },
    { label: "Converted Leads", value: convertedLeads, icon: CheckCircleOutlineOutlinedIcon, color: "#16a34a" },
    { label: "Today's Leads", value: todaysNewLeads, icon: CalendarTodayOutlinedIcon, color: "#0284c7" },
    { label: "Today's Follow-ups", value: todaysFollowUps, icon: EventAvailableOutlinedIcon, color: "#ea580c" },
    { label: "Overdue Follow-ups", value: overdueFollowUps, icon: ScheduleOutlinedIcon, color: "#dc2626" },
    { label: "Upcoming Tasks", value: upcomingTasks, icon: AssignmentTurnedInOutlinedIcon, color: "#9333ea" },
    { label: "Priority Leads", value: priorityLeads, icon: PriorityHighOutlinedIcon, color: "#0891b2" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUpOutlinedIcon, color: "#0f172a" }
  ];

  const recentActivities = useMemo(
    () => leads
      .flatMap((lead) => (lead.activities || []).map((activity) => ({ lead, ...activity })))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6),
    [leads]
  );

  const recentAssignedLeads = useMemo(
    () => leads
      .filter((lead) => lead.assignedTo)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .slice(0, 6),
    [leads]
  );

  const handleQuickAction = (target) => {
    switch (target) {
      case "add":
        setAddLeadOpen(true);
        break;
      case "pipeline":
        navigate("/adviser/lead-management/pipeline");
        break;
      case "tasks":
        navigate("/adviser/lead-management/tasks");
        break;
      case "all":
        navigate("/adviser/lead-management/all");
        break;
      default:
        break;
    }
  };

  const handleAddLead = async (lead) => {
    try {
      await addCandidate({
        ...lead,
        leadId: lead.leadId || `LD-${1000 + leads.length + 1}`,
        leadType: "Insurance Customer",
        workflowStage: lead.workflowStage || "New Lead",
        leadStatus: lead.leadStatus || "Open",
        leadSource: lead.leadSource || lead.source || "Referral",
        source: lead.source || lead.leadSource || "Referral",
        nextFollowUp: lead.nextFollowUp || ""
      });
      setAddLeadOpen(false);
    } catch {
    }
  };

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Lead Management Dashboard</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>
            Overview of insurance prospecting, recruitment, and sales activity.
          </Typography>
        </Box>
      </Box>

      <div className="dashboard-grid">
        {kpiCards.map((card) => (
          <KPI key={card.label} label={card.label} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </div>

      <div className="grid-2-columns">
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
          <div className="action-grid">
            <Button variant="outlined" size="small" onClick={() => handleQuickAction("add")}>Add New Lead</Button>
            <Button variant="outlined" size="small" onClick={() => handleQuickAction("pipeline")}>Open Pipeline</Button>
            <Button variant="outlined" size="small" onClick={() => handleQuickAction("tasks")}>Review Tasks</Button>
            <Button variant="outlined" size="small" onClick={() => handleQuickAction("all")}>View All Leads</Button>
          </div>
        </Paper>
      </div>

      <div className="grid-2-columns">
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recruitment Funnel</Typography>
          <FunnelChart stages={advisorFunnelData} />
        </Paper>
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Sales Funnel</Typography>
          <FunnelChart stages={insuranceFunnelData} />
        </Paper>
      </div>

      <div className="grid-2-columns">
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Assigned Leads</Typography>
          <div className="recent-list">
            {recentAssignedLeads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>No records found</div>
            ) : (
              recentAssignedLeads.map((lead) => (
                <div key={lead.id} className="recent-item">
                  <div>
                    <strong>{lead.leadId}</strong>
                    <p>{lead.name}</p>
                  </div>
                  <span>{lead.assignedTo}</span>
                </div>
              ))
            )}
          </div>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Activities</Typography>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>No follow-ups scheduled</div>
            ) : (
              recentActivities.map((item, index) => (
                <Link
                  key={`${item.lead.id}-${index}`}
                  className="activity-item"
                  to={`/adviser/lead-management/lead/${item.lead.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="activity-dot" style={{ background: "#2563eb" }} />
                  <div>
                    <strong>{item.lead.name}</strong>
                    <p>{item.text}</p>
                  </div>
                  <span>{formatDate(item.date)}</span>
                </Link>
              ))
            )}
          </div>
        </Paper>
      </div>

      <CandidateForm open={addLeadOpen} onClose={() => setAddLeadOpen(false)} onAdd={handleAddLead} />
    </div>
  );
}

export default LeadDashboard;
