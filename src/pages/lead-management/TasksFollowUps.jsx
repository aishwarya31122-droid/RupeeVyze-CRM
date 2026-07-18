import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { formatDate, getOverdueFollowUps, getTodayFollowUps, getUpcomingFollowUps } from "../../utils.js";
import { useCrm } from "../../crmContext.jsx";

const priorityColors = {
  High: "error",
  Medium: "warning",
  Low: "success"
};

const statusColors = {
  Open: "info",
  Pending: "warning",
  "In Progress": "secondary",
  Completed: "success",
  Done: "success"
};

function TasksFollowUps() {
  const { candidates, updateCandidate } = useCrm();
  const leads = useMemo(() => candidates.filter((c) => !c.leadType || c.leadType === "Insurance Customer"), [candidates]);
  const [selectedLead, setSelectedLead] = useState(String(leads[0]?.id || ""));
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", dueDate: "", priority: "Medium", notes: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [leadTypeFilter, setLeadTypeFilter] = useState("All");
  const [assignedFilter, setAssignedFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  const lead = useMemo(() => leads.find((l) => String(l.id) === selectedLead) || leads[0] || null, [leads, selectedLead]);

  useEffect(() => {
    if (!leads.length) {
      setSelectedLead("");
      return;
    }

    if (!selectedLead || !leads.some((item) => String(item.id) === selectedLead)) {
      setSelectedLead(String(leads[0].id));
    }
  }, [leads, selectedLead]);

  const resolveFollowUpDate = (leadItem, index) => {
    if (leadItem.nextFollowUp) return leadItem.nextFollowUp;
    const baseDate = leadItem.createdDate ? new Date(leadItem.createdDate) : new Date();
    const fallbackDate = new Date(baseDate);
    fallbackDate.setDate(baseDate.getDate() + 4 + (index % 3));
    return fallbackDate.toISOString().slice(0, 10);
  };

  const buildTaskRow = (leadItem, index) => {
    const existingTask = (leadItem.tasks || [])[0];
    const dueDate = existingTask?.dueDate || resolveFollowUpDate(leadItem, index);
    const priority = existingTask?.priority || leadItem.priority || leadItem.followUp?.priority || "Medium";
    const assignedTo = existingTask?.assignedTo || leadItem.assignedTo || leadItem.advisorAssigned || "Unassigned";
    const status = existingTask?.status || (leadItem.followUp?.status === "Done" ? "Completed" : "Open");

    return {
      id: existingTask?.id || `T-${leadItem.id}`,
      title: existingTask?.title || `Follow up on ${leadItem.name}`,
      assignedTo,
      dueDate,
      priority,
      status,
      notes: existingTask?.notes || `Prepare the next step for ${leadItem.name} in ${leadItem.workflowStage || "the pipeline"}.`,
      lead: leadItem,
      leadId: leadItem.leadId,
      leadName: leadItem.name,
      leadType: leadItem.leadType,
      workflowStage: leadItem.workflowStage,
      leadMobile: leadItem.mobile
    };
  };

  const taskRows = useMemo(() => leads.map((leadItem, index) => buildTaskRow(leadItem, index)), [leads]);

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return taskRows.filter((row) => {
      const matchesSearch =
        !search ||
        row.leadName?.toLowerCase().includes(search) ||
        row.leadId?.toLowerCase().includes(search) ||
        row.leadMobile?.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || row.priority === priorityFilter;
      const matchesLeadType = leadTypeFilter === "All" || row.leadType === leadTypeFilter;
      const matchesAssigned = assignedFilter === "All" || row.assignedTo === assignedFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesLeadType && matchesAssigned;
    });
  }, [assignedFilter, leadTypeFilter, priorityFilter, searchTerm, statusFilter, taskRows]);

  const kpiCards = useMemo(() => {
    const todayFollowUps = getTodayFollowUps(leads).length;
    const upcomingFollowUps = getUpcomingFollowUps(leads).length;
    const overdueFollowUps = getOverdueFollowUps(leads).length;
    const pendingTasks = taskRows.filter((task) => !["Completed", "Done"].includes(task.status)).length;
    const completedTasks = taskRows.filter((task) => ["Completed", "Done"].includes(task.status)).length;

    return [
      { label: "Today's Follow-ups", value: todayFollowUps, icon: CalendarTodayOutlinedIcon, color: "#2563eb" },
      { label: "Upcoming Follow-ups", value: upcomingFollowUps, icon: EventAvailableOutlinedIcon, color: "#0f766e" },
      { label: "Overdue Follow-ups", value: overdueFollowUps, icon: ScheduleOutlinedIcon, color: "#dc2626" },
      { label: "Pending Tasks", value: pendingTasks, icon: AssignmentLateOutlinedIcon, color: "#d97706" },
      { label: "Completed Tasks", value: completedTasks, icon: AssignmentTurnedInOutlinedIcon, color: "#16a34a" }
    ];
  }, [leads, taskRows]);

  const followUpCards = useMemo(
    () =>
      taskRows
        .map((row) => ({
          ...row,
          nextFollowUp: row.dueDate,
          leadType: row.leadType,
          currentStage: row.workflowStage,
          assignedRecruiter: row.assignedTo,
          priority: row.priority
        }))
        .sort((a, b) => (a.nextFollowUp || "").localeCompare(b.nextFollowUp || "")),
    [taskRows]
  );

  const recentActivity = useMemo(() => {
    const entries = leads.flatMap((leadItem) => {
      const activityList = (leadItem.activities || []).map((activity, index) => ({
        date: activity.date || leadItem.createdDate || "",
        time: activity.time || `${index + 1}:00 PM`,
        recruiter: leadItem.assignedTo || leadItem.advisorAssigned || "Unassigned",
        leadName: leadItem.name,
        activity: activity.text || `${activity.type || "Activity"} logged for ${leadItem.name}`
      }));

      const timelineList = (leadItem.timeline || []).map((entry, index) => ({
        date: entry.date || leadItem.createdDate || "",
        time: `${index + 1}:30 PM`,
        recruiter: leadItem.assignedTo || leadItem.advisorAssigned || "Unassigned",
        leadName: leadItem.name,
        activity: `${entry.stage || "Stage updated"} recorded`
      }));

      return [...activityList, ...timelineList];
    });

    return entries.sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 6);
  }, [leads]);

  const handleLeadChange = (event) => {
    setSelectedLead(event.target.value);
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setNewTask((current) => ({ ...current, [name]: value }));
  };

  const handleAddTask = () => {
    if (!lead || !newTask.title.trim()) return;

    const task = {
      id: `T-${Date.now()}`,
      title: newTask.title.trim(),
      assignedTo: newTask.assignedTo.trim() || "Unassigned",
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: "Open",
      notes: newTask.notes.trim()
    };

    updateCandidate(lead.id, { tasks: [...(lead.tasks || []), task] });
    setNewTask({ title: "", assignedTo: "", dueDate: "", priority: "Medium", notes: "" });
    setDialogOpen(false);
  };

  const handleTaskComplete = (row) => {
    if (!row?.lead) return;
    const existingTasks = Array.isArray(row.lead.tasks) ? row.lead.tasks : [];
    const updatedTasks = existingTasks.length
      ? existingTasks.map((task) => (task.id === row.id ? { ...task, status: "Completed" } : task))
      : [{ id: row.id, title: row.title, assignedTo: row.assignedTo, dueDate: row.dueDate, priority: row.priority, status: "Completed", notes: row.notes }];
    updateCandidate(row.lead.id, { tasks: updatedTasks });
  };

  const handleFollowUpAction = (leadItem, action) => {
    if (!leadItem) return;
    if (action === "mark-complete") {
      updateCandidate(leadItem.id, { followUp: { ...(leadItem.followUp || {}), status: "Done" } });
      return;
    }
    if (action === "reschedule") {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);
      updateCandidate(leadItem.id, {
        nextFollowUp: nextDate.toISOString().slice(0, 10),
        followUp: { ...(leadItem.followUp || {}), status: "Pending" }
      });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Tasks & Follow-ups</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>Track actions, follow-ups, and task completion for every lead.</Typography>
        </Box>
        <Button variant="contained" onClick={() => setDialogOpen(true)} startIcon={<AssignmentLateOutlinedIcon />}>
          Create Task
        </Button>
      </Box>

      <Grid container spacing={2}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={card.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)" }}>
                <CardContent>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ bgcolor: `${card.color}18`, color: card.color, borderRadius: "50%", p: 1, display: "flex" }}>
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

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Lead name, lead ID or mobile"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <MenuItem value="All">All statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
              <MenuItem value="All">All priorities</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Lead Type</InputLabel>
            <Select label="Lead Type" value={leadTypeFilter} onChange={(event) => setLeadTypeFilter(event.target.value)}>
              <MenuItem value="All">All lead types</MenuItem>
              {Array.from(new Set(leads.map((item) => item.leadType).filter(Boolean))).map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select label="Assigned To" value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)}>
              <MenuItem value="All">All assignees</MenuItem>
              {Array.from(new Set(taskRows.map((row) => row.assignedTo).filter(Boolean))).map((person) => (
                <MenuItem key={person} value={person}>{person}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Task ID</TableCell>
                <TableCell>Lead Name</TableCell>
                <TableCell>Current Stage</TableCell>
                <TableCell>Task Title</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No tasks match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.leadName}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.leadId}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.workflowStage}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.assignedTo}</TableCell>
                    <TableCell>{formatDate(row.dueDate)}</TableCell>
                    <TableCell>
                      <Chip label={row.priority} color={priorityColors[row.priority] || "default"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.status} color={statusColors[row.status] || "default"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">View</Button>
                        <Button size="small" variant="outlined" onClick={() => { setSelectedLead(String(row.lead?.id || "")); setDialogOpen(true); }}>Edit</Button>
                        <Button size="small" variant="contained" onClick={() => handleTaskComplete(row)}>Complete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Follow-up Cards</Typography>
          <Typography variant="body2" color="text.secondary">Keep follow-up actions organized and ready for the next outreach.</Typography>
        </Box>
        <Grid container spacing={2}>
          {followUpCards.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "center", py: 3, color: "#64748b" }}>
                <Typography variant="body2">No follow-ups scheduled</Typography>
              </Box>
            </Grid>
          ) : (
            followUpCards.map((leadItem) => (
              <Grid item xs={12} md={6} lg={4} key={leadItem.id}>
                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{leadItem.name}</Typography>
                        <Chip label={leadItem.priority} color={priorityColors[leadItem.priority] || "default"} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{leadItem.currentStage}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonOutlineOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{leadItem.assignedRecruiter}</Typography>
                      </Stack>
                      <Typography variant="body2">Next follow-up: {formatDate(leadItem.nextFollowUp)}</Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button size="small" variant="outlined">Call</Button>
                        <Button size="small" variant="outlined" onClick={() => handleFollowUpAction(leadItem, "mark-complete")}>Complete</Button>
                        <Button size="small" variant="outlined" onClick={() => handleFollowUpAction(leadItem, "reschedule")}>Reschedule</Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Follow-up Activity</Typography>
        <Stack spacing={1.5}>
          {recentActivity.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 2, color: "#64748b" }}>
              <Typography variant="body2">No follow-ups scheduled</Typography>
            </Box>
          ) : (
            recentActivity.map((item) => (
              <Box key={`${item.leadName}-${item.date}-${item.activity}`} sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.leadName}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDate(item.date)} · {item.time}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{item.activity}</Typography>
                <Typography variant="caption" color="text.secondary">Recruiter: {item.recruiter}</Typography>
              </Box>
            ))
          )}
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Task</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Lead</InputLabel>
              <Select label="Lead" value={selectedLead} onChange={handleLeadChange}>
                {leads.map((leadOption) => (
                  <MenuItem key={leadOption.id} value={String(leadOption.id)}>
                    {leadOption.leadId} — {leadOption.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Task Title" name="title" value={newTask.title} onChange={handleTaskChange} fullWidth size="small" />
            <TextField label="Assigned To" name="assignedTo" value={newTask.assignedTo} onChange={handleTaskChange} fullWidth size="small" />
            <TextField label="Due Date" name="dueDate" type="date" value={newTask.dueDate} onChange={handleTaskChange} InputLabelProps={{ shrink: true }} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" name="priority" value={newTask.priority} onChange={handleTaskChange}>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes" name="notes" value={newTask.notes} onChange={handleTaskChange} multiline minRows={3} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TasksFollowUps;
