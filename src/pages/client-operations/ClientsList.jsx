import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EventIcon from "@mui/icons-material/Event";
import { useCrm } from "../../crmContext.jsx";

export default function ClientsList() {
  const navigate = useNavigate();
  const { clients } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredClients = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return (clients || []).filter((client) => {
      const matchesSearch = !normalized || client.name.toLowerCase().includes(normalized) || client.city.toLowerCase().includes(normalized) || client.advisorAssigned.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || (client.finalStatus || "Active Client") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => {
    const active = clients.filter((client) => (client.finalStatus || "Active Client") === "Active Client").length;
    const newClients = clients.filter((client) => client.dateReceived && client.dateReceived.startsWith("2026-06")).length;
    const inactive = clients.filter((client) => (client.finalStatus || "Active Client") === "Lost" || (client.finalStatus || "Active Client") === "Follow-up Pending").length;

    return [
      { label: "Total Clients", value: clients.length, icon: PersonIcon, color: "#2563eb" },
      { label: "Active Clients", value: active, icon: VerifiedUserIcon, color: "#16a34a" },
      { label: "New Clients", value: newClients, icon: EventIcon, color: "#d97706" },
      { label: "Inactive Clients", value: inactive, icon: PersonIcon, color: "#7c3aed" }
    ];
  }, [clients]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Client Portfolio</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          A professional client directory with status, advisor ownership and servicing context.
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
            <TextField size="small" placeholder="Search client, city or advisor" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active Client">Active Client</MenuItem>
                <MenuItem value="Proposal Submitted">Proposal Submitted</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
                <MenuItem value="Follow-up Pending">Follow-up Pending</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client ID</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Advisor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.clientId || client.id} hover>
                  <TableCell>{client.clientId || client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.mobile}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>{client.advisorAssigned}</TableCell>
                  <TableCell>
                    <Chip label={client.finalStatus || "Active Client"} size="small" color={client.finalStatus === "Active Client" ? "success" : client.finalStatus === "Lost" ? "error" : "info"} />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/adviser/client-operations/clients/${client.clientId || client.id}`)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
