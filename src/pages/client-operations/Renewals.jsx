import { useMemo, useState } from "react";
import {
  Box,
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AlarmIcon from "@mui/icons-material/Alarm";
import { useCrm } from "../../crmContext.jsx";

const statusColors = {
  Upcoming: "info",
  Overdue: "error",
  Completed: "success"
};

export default function Renewals() {
  const { clients } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const renewals = useMemo(() => {
    return (clients || []).flatMap((client) => (
      (client.renewals || []).map((renewal) => ({
        ...renewal,
        clientName: client.name,
        policyNumber: renewal.policyNumber || client.policyNumber || "—",
        status: renewal.status || (renewal.dueDate && renewal.dueDate < "2026-07-15" ? "Overdue" : "Upcoming")
      }))
    ));
  }, [clients]);

  const filteredRenewals = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return renewals.filter((renewal) => {
      const matchesSearch = !normalized || renewal.clientName.toLowerCase().includes(normalized) || renewal.policyNumber.toLowerCase().includes(normalized) || renewal.advisor.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || renewal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [renewals, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => [
    { label: "Upcoming Renewals", value: renewals.filter((renewal) => renewal.status === "Upcoming").length, icon: CalendarTodayIcon, color: "#2563eb" },
    { label: "Overdue Renewals", value: renewals.filter((renewal) => renewal.status === "Overdue").length, icon: AlarmIcon, color: "#dc2626" },
    { label: "Renewal Premium", value: `₹${renewals.reduce((sum, renewal) => sum + Number(renewal.premium || 0), 0).toLocaleString("en-IN")}`, icon: CalendarTodayIcon, color: "#16a34a" }
  ], [renewals]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Renewal Management</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Automated renewals pipeline with special focus on upcoming and overdue premium collections.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={card.label}>
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
            <TextField size="small" placeholder="Search renewal or client" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Upcoming">Upcoming</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy Number</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Premium Due</TableCell>
                <TableCell>Renewal Reminder</TableCell>
                <TableCell>Advisor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRenewals.map((renewal) => (
                <TableRow key={`${renewal.policyNumber}-${renewal.clientName}`} hover>
                  <TableCell>{renewal.policyNumber}</TableCell>
                  <TableCell>{renewal.clientName}</TableCell>
                  <TableCell>₹{Number(renewal.premium || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{renewal.dueDate || "—"}</TableCell>
                  <TableCell>{renewal.advisor}</TableCell>
                  <TableCell><Chip label={renewal.status} size="small" color={statusColors[renewal.status] || "default"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
