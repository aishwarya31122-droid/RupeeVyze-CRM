import { useMemo, useState } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
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

function LeadDashboard({ leads = [] }) {
  const navigate = useNavigate();
  const { addCandidate } = useCrm();
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const totalLeads = leads.length;
  const advisorLeads = leads.filter((l) => l.leadType === "Advisor Recruitment").length;
  const customerLeads = leads.filter((l) => l.leadType === "Insurance Customer").length;
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

  const advisorFunnelStages = useMemo(() => {
    const advisorLeadsList = leads.filter((lead) => lead.leadType === "Advisor Recruitment");
    const stages = ["New Lead", "First Contact", "Interested", "KYC Pending", "KYC Complete", "Training", "Exam", "Code Generation", "Activation", "Business Started"];
    return stages.map((stage) => ({ stage, count: advisorLeadsList.filter((lead) => lead.workflowStage === stage).length }));
  }, [leads]);

  const customerFunnelStages = useMemo(() => {
    const customerLeadsList = leads.filter((lead) => lead.leadType === "Insurance Customer");
    const stages = ["New Lead", "Qualified", "Financial Need Analysis", "Product Recommendation", "Illustration Shared", "Proposal Submitted", "Medical", "Underwriting", "Policy Issued", "Premium Collected", "Active Client"];
    return stages.map((stage) => ({ stage, count: customerLeadsList.filter((lead) => lead.workflowStage === stage).length }));
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

  const handleAddLead = (lead) => {
    addCandidate({
      ...lead,
      leadId: lead.leadId || `LD-${1000 + leads.length + 1}`,
      workflowStage: lead.workflowStage || "New Lead",
      leadStatus: lead.leadStatus || "Open",
      leadSource: lead.leadSource || lead.source || "Referral",
      source: lead.source || lead.leadSource || "Referral"
    });
    setAddLeadOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Lead Management Dashboard</h1>
          <p>Overview of insurance prospecting, recruitment, and sales activity.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {kpiCards.map((card) => (
          <KPI key={card.label} label={card.label} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </div>

      <div className="grid-2-columns">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button type="button" className="button secondary" onClick={() => handleQuickAction("add")}>Add New Lead</button>
            <button type="button" className="button secondary" onClick={() => handleQuickAction("pipeline")}>Open Pipeline</button>
            <button type="button" className="button secondary" onClick={() => handleQuickAction("tasks")}>Review Tasks</button>
            <button type="button" className="button secondary" onClick={() => handleQuickAction("all")}>View All Leads</button>
          </div>
        </div>
      </div>

      <div className="grid-2-columns">
        <div className="card">
          <h3>Recruitment Funnel</h3>
          <FunnelChart stages={advisorFunnelStages} />
        </div>
        <div className="card">
          <h3>Sales Funnel</h3>
          <FunnelChart stages={customerFunnelStages} />
        </div>
      </div>

      <div className="grid-2-columns">
        <div className="card">
          <h3>Recent Assigned Leads</h3>
          <div className="recent-list">
            {recentAssignedLeads.map((lead) => (
              <div key={lead.id} className="recent-item">
                <div>
                  <strong>{lead.leadId}</strong>
                  <p>{lead.name}</p>
                </div>
                <span>{lead.assignedTo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent Activities</h3>
          <div className="activity-list">
            {recentActivities.map((item, index) => (
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
            ))}
          </div>
        </div>
      </div>

      <CandidateForm open={addLeadOpen} onClose={() => setAddLeadOpen(false)} onAdd={handleAddLead} />
    </div>
  );
}

export default LeadDashboard;
