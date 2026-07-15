import { useMemo, useState } from "react";
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
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import InboxIcon from "@mui/icons-material/Inbox";
import { useCrm } from "../../crmContext.jsx";

const statusColors = {
  Open: "warning",
  "In Progress": "info",
  Resolved: "success",
  Escalated: "error"
};

function Services() {
  const { clients } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);

  const services = useMemo(() => {
    return (clients || []).flatMap((client) => {
      const baseRequests = [
        {
          id: `${client.id}-svc-1`,
          serviceType: "Policy Review",
          clientName: client.name,
          assignedTo: client.advisorAssigned,
          status: client.finalStatus === "Active Client" ? "In Progress" : "Open",
          priority: client.interestLevel === "High" ? "High" : "Medium",
          createdDate: client.dateReceived,
          notes: `${client.name} requested a policy review and premium comparison.`
        },
        {
          id: `${client.id}-svc-2`,
          serviceType: "Renewal Reminder",
          clientName: client.name,
          assignedTo: client.advisorAssigned,
          status: client.followUpStatus === "Overdue" ? "Escalated" : "Open",
          priority: client.leadQuality === "Hot" ? "High" : "Low",
          createdDate: client.nextFollowUpDate,
          notes: `Follow-up reminder scheduled for ${client.nextFollowUpDate || "upcoming review"}.`
        }
      ];

      return baseRequests;
    });
  }, [clients]);

  const filteredServices = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch = !normalized || service.clientName.toLowerCase().includes(normalized) || service.serviceType.toLowerCase().includes(normalized) || service.assignedTo.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => {
    const openCount = services.filter((service) => service.status === "Open").length;
    const progressCount = services.filter((service) => service.status === "In Progress").length;
    const resolvedCount = services.filter((service) => service.status === "Resolved").length;
    const escalatedCount = services.filter((service) => service.status === "Escalated").length;

    return [
      { label: "Open Requests", value: openCount, icon: AssignmentLateIcon, color: "#d97706" },
      { label: "In Progress", value: progressCount, icon: SupportAgentIcon, color: "#2563eb" },
      { label: "Resolved", value: resolvedCount, icon: InboxIcon, color: "#16a34a" },
      { label: "Escalated", value: escalatedCount, icon: AssignmentLateIcon, color: "#dc2626" }
    ];
  }, [services]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Customer Service Requests</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Operational support track for renewals, policy reviews, and client follow-up needs.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {summaryCards.map((card) => {
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

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField size="small" placeholder="Search service or client" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Escalated">Escalated</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Type</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#64748b" }}>No service requests found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>{service.serviceType}</TableCell>
                    <TableCell>{service.clientName}</TableCell>
                    <TableCell>{service.assignedTo}</TableCell>
                    <TableCell>
                      <Chip label={service.status} color={statusColors[service.status] || "default"} size="small" />
                    </TableCell>
                    <TableCell>{service.priority}</TableCell>
                    <TableCell>{service.createdDate}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => setSelectedService(service)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(selectedService)} onClose={() => setSelectedService(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Service Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedService && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedService.serviceType}</Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2"><strong>Client:</strong> {selectedService.clientName}</Typography>
                <Typography variant="body2"><strong>Assigned To:</strong> {selectedService.assignedTo}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {selectedService.status}</Typography>
                <Typography variant="body2"><strong>Priority:</strong> {selectedService.priority}</Typography>
                <Typography variant="body2"><strong>Created:</strong> {selectedService.createdDate}</Typography>
                <Typography variant="body2"><strong>Notes:</strong> {selectedService.notes}</Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedService(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Services;
