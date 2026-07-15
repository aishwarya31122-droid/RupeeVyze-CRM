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
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useCrm } from "../../crmContext.jsx";

const statusColors = {
  Pending: "warning",
  Approved: "success",
  Rejected: "error",
  Processing: "info"
};

export default function Claims() {
  const { clients } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const claims = useMemo(() => {
    return (clients || []).flatMap((client) => (
      (client.claims || []).map((claim) => ({
        ...claim,
        clientName: client.name,
        policyNumber: claim.policyNumber || client.policyNumber || "—"
      }))
    ));
  }, [clients]);

  const filteredClaims = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return claims.filter((claim) => {
      const matchesSearch = !normalized || claim.clientName.toLowerCase().includes(normalized) || claim.policyNumber.toLowerCase().includes(normalized) || claim.remarks.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => [
    { label: "Pending", value: claims.filter((claim) => claim.status === "Pending").length, icon: ReportProblemIcon, color: "#d97706" },
    { label: "Approved", value: claims.filter((claim) => claim.status === "Approved").length, icon: DoneAllIcon, color: "#16a34a" },
    { label: "Processing", value: claims.filter((claim) => claim.status === "Processing").length, icon: ReportProblemIcon, color: "#2563eb" },
    { label: "Claim Amount", value: `₹${claims.reduce((sum, claim) => sum + Number(claim.amount || 0), 0).toLocaleString("en-IN")}`, icon: DoneAllIcon, color: "#7c3aed" }
  ], [claims]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Claims Tracker</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Claim approvals, settlement status and service note tracking for policyholders.
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
            <TextField size="small" placeholder="Search claim or client" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Claim ID</TableCell>
                <TableCell>Policy</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Claim Amount</TableCell>
                <TableCell>Settlement Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.claimId} hover>
                  <TableCell>{claim.claimId}</TableCell>
                  <TableCell>{claim.policyNumber}</TableCell>
                  <TableCell>{claim.clientName}</TableCell>
                  <TableCell>₹{Number(claim.amount || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{claim.settlementDate || "—"}</TableCell>
                  <TableCell><Chip label={claim.status} size="small" color={statusColors[claim.status] || "default"} /></TableCell>
                  <TableCell>{claim.remarks || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
