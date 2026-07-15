import React, { useMemo, useState } from "react";
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
  Divider,
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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import InboxIcon from "@mui/icons-material/Inbox";
import { useCrm } from "../../crmContext.jsx";
import { getActiveAdvisorRows } from "./advisorOperationsData.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function ActiveAdvisors() {
  const { candidates, performanceRecords } = useCrm();
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const advisors = useMemo(() => getActiveAdvisorRows(candidates, performanceRecords), [candidates, performanceRecords]);

  const filteredAdvisors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return advisors.filter((advisor) => {
      const matchesSearch = !normalizedSearch || advisor.name.toLowerCase().includes(normalizedSearch) || advisor.advisorCode.toLowerCase().includes(normalizedSearch) || (advisor.city || "").toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "All" || advisor.businessStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [advisors, searchTerm, statusFilter]);

  const summaryCards = useMemo(() => {
    const totalActive = advisors.length;
    const topPerformer = advisors.reduce((best, current) => (current.premiumCollected > (best?.premiumCollected || 0) ? current : best), null);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newActivations = advisors.filter((advisor) => advisor.createdDate && advisor.createdDate.startsWith(currentMonth)).length;
    const averagePersistency = totalActive ? advisors.reduce((sum, advisor) => sum + advisor.persistency, 0) / totalActive : 0;

    return [
      { label: "Total Active Advisors", value: totalActive, icon: PersonIcon, color: "#2563eb" },
      { label: "Top Performer", value: topPerformer?.name || "—", icon: TrendingUpIcon, color: "#16a34a" },
      { label: "New Activations This Month", value: newActivations, icon: EventIcon, color: "#d97706" },
      { label: "Average Persistency", value: `${averagePersistency.toFixed(1)}%`, icon: VerifiedUserIcon, color: "#7c3aed" }
    ];
  }, [advisors]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Active Advisors Directory</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          A professional view of converted advisors with current production status and business health.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
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
            <TextField size="small" placeholder="Search by name, code or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Business Status</InputLabel>
              <Select value={statusFilter} label="Business Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Healthy">Healthy</MenuItem>
                <MenuItem value="On Track">On Track</MenuItem>
                <MenuItem value="Watchlist">Watchlist</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {filteredAdvisors.length} advisor{filteredAdvisors.length !== 1 ? "s" : ""} found
            </Typography>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Advisor Code</TableCell>
                <TableCell>Advisor Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Activation Date</TableCell>
                <TableCell>Recruiter</TableCell>
                <TableCell>Current Status</TableCell>
                <TableCell>Policies Sold</TableCell>
                <TableCell>Premium Collected</TableCell>
                <TableCell>Persistency %</TableCell>
                <TableCell>Monthly Target</TableCell>
                <TableCell>Achievement %</TableCell>
                <TableCell>Business Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdvisors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                      <InboxIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#64748b" }}>No active advisors found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== "All" ? "Try adjusting your filters." : "Converted advisors will appear here."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdvisors.map((advisor) => (
                  <TableRow key={advisor.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>{advisor.advisorCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{advisor.name}</Typography>
                    </TableCell>
                    <TableCell>{advisor.mobile}</TableCell>
                    <TableCell>{advisor.city}</TableCell>
                    <TableCell>{advisor.createdDate || "—"}</TableCell>
                    <TableCell>{advisor.assignedTo}</TableCell>
                    <TableCell>
                      <Chip label={advisor.workflowStage || advisor.leadStatus} size="small" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>{advisor.policiesSold}</TableCell>
                    <TableCell>{formatCurrency(advisor.premiumCollected)}</TableCell>
                    <TableCell>{advisor.persistency}%</TableCell>
                    <TableCell>{formatCurrency(advisor.monthlyTarget)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: advisor.achievement >= 100 ? "#16a34a" : advisor.achievement >= 70 ? "#2563eb" : "#d97706" }}>
                        {advisor.achievement.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={advisor.businessStatus} size="small" color={advisor.businessStatus === "Healthy" ? "success" : advisor.businessStatus === "On Track" ? "info" : "warning"} />
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => setSelectedAdvisor(advisor)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(selectedAdvisor)} onClose={() => setSelectedAdvisor(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Advisor Profile</DialogTitle>
        <DialogContent dividers>
          {selectedAdvisor && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1.5 }}>
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedAdvisor.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedAdvisor.advisorCode} • {selectedAdvisor.city}</Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <Chip label={selectedAdvisor.businessStatus} color={selectedAdvisor.businessStatus === "Healthy" ? "success" : selectedAdvisor.businessStatus === "On Track" ? "info" : "warning"} />
                </Box>
              </Box>

              <Divider />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#475569", textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>Contact Information</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2"><strong>Mobile:</strong> {selectedAdvisor.mobile}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedAdvisor.email}</Typography>
                    <Typography variant="body2"><strong>Recruiter:</strong> {selectedAdvisor.assignedTo}</Typography>
                    <Typography variant="body2"><strong>Source:</strong> {selectedAdvisor.leadSource}</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#475569", textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>Performance Metrics</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2"><strong>Policies Sold:</strong> {selectedAdvisor.policiesSold}</Typography>
                    <Typography variant="body2"><strong>Premium Collected:</strong> {formatCurrency(selectedAdvisor.premiumCollected)}</Typography>
                    <Typography variant="body2"><strong>Persistency:</strong> {selectedAdvisor.persistency}%</Typography>
                    <Typography variant="body2"><strong>Monthly Target:</strong> {formatCurrency(selectedAdvisor.monthlyTarget)}</Typography>
                    <Typography variant="body2"><strong>Achievement:</strong> {selectedAdvisor.achievement.toFixed(1)}%</Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "#475569", textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>Notes</Typography>
                <Typography variant="body2" sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}>{selectedAdvisor.notes || "No additional notes were captured."}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAdvisor(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActiveAdvisors;
