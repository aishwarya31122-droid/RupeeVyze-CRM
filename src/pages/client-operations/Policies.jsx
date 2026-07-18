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
import PolicyIcon from "@mui/icons-material/Policy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useCrm } from "../../crmContext.jsx";

const statusColors = {
  Active: "success",
  "In Force": "success",
  Pending: "warning",
  Lapsed: "error"
};

export default function Policies() {
  const { clients } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const policies = useMemo(() => {
    return (clients || []).flatMap((client) => (
      (client.policies || []).map((policy) => ({
        ...policy,
        clientName: client.name,
        advisor: client.advisorAssigned,
        issueDate: client.dateReceived,
        renewalDate: client.nextFollowUpDate,
        status: policy.status || "Active"
      }))
    ));
  }, [clients]);

  const filteredPolicies = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return policies.filter((policy) => {
      const matchesSearch = !normalized || policy.policyNumber.toLowerCase().includes(normalized) || policy.clientName.toLowerCase().includes(normalized) || policy.advisor.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || policy.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [policies, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => [
    { label: "Active Policies", value: policies.filter((policy) => policy.status === "Active" || policy.status === "In Force").length, icon: PolicyIcon, color: "#2563eb" },
    { label: "Pending Policies", value: policies.filter((policy) => policy.status === "Pending").length, icon: TrendingUpIcon, color: "#d97706" },
    { label: "Total Premium", value: `₹${policies.reduce((sum, policy) => sum + Number(policy.premium || 0), 0).toLocaleString("en-IN")}`, icon: PolicyIcon, color: "#16a34a" }
  ], [policies]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Policy Management</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Live client policy portfolio with servicing and renewal visibility.
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
            <TextField size="small" placeholder="Search policy or client" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="In Force">In Force</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Lapsed">Lapsed</MenuItem>
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
                <TableCell>Advisor</TableCell>
                <TableCell>Policy Type</TableCell>
                <TableCell>Sum Assured</TableCell>
                <TableCell>Premium</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Renewal Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No records found</TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.policyNumber} hover>
                    <TableCell>{policy.policyNumber}</TableCell>
                    <TableCell>{policy.clientName}</TableCell>
                    <TableCell>{policy.advisor}</TableCell>
                    <TableCell>{policy.policyType}</TableCell>
                    <TableCell>{policy.sumAssured}</TableCell>
                    <TableCell>₹{Number(policy.premium || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell>{policy.issueDate}</TableCell>
                    <TableCell>{policy.renewalDate}</TableCell>
                    <TableCell><Chip label={policy.status} size="small" color={statusColors[policy.status] || "default"} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
