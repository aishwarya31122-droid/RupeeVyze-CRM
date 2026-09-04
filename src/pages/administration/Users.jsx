import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useCrm } from "../../crmContext.jsx";
import { supabase } from "../../supabaseClient.js";

export default function Users() {
  const { teamMembers, roles, candidates = [] } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", candidateId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const uniqueRoles = useMemo(() => {
    const memberRoles = [...new Set(teamMembers.map((m) => m.role).filter(Boolean))];
    const contextRoles = roles.map((r) => r.name).filter(Boolean);
    return [...new Set([...contextRoles, ...memberRoles])];
  }, [teamMembers, roles]);

  const filteredUsers = useMemo(() => teamMembers.filter((member) => {
    const matchesSearch = !searchTerm || member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  }), [searchTerm, roleFilter, teamMembers]);

  // Advisor-type candidates that could be linked to a new login
  const advisorCandidates = useMemo(
    () => candidates.filter((c) => c.leadType === "Advisor" || c.leadType === "Recruitment"),
    [candidates]
  );

  const openDialog = () => {
    setForm({ name: "", email: "", password: "", candidateId: "" });
    setFormError("");
    setFormSuccess("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    setFormError("");
    setFormSuccess("");
    if (!form.name || !form.email || !form.password) {
      setFormError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-advisor`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            candidateId: form.candidateId || undefined,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create advisor account.");
      }

      setFormSuccess(`Advisor account created for ${form.name}.`);
      setForm({ name: "", email: "", password: "", candidateId: "" });
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>User Directory</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>Manage permissions, status and operational access for CRM users.</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openDialog}>Add Advisor</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{teamMembers.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField size="small" placeholder="Search user" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(event) => setRoleFilter(event.target.value)}>
                <MenuItem value="All">All Roles</MenuItem>
                {uniqueRoles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No records found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell><Chip label={member.status || "Active"} size="small" color="success" /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">Edit</Button>
                        <Button size="small" variant="text" color="error">Deactivate</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Advisor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Creates a real login for this advisor. They'll be able to sign in immediately with the email and password you set here.
            </Typography>
            {formError && <Alert severity="error">{formError}</Alert>}
            {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Temporary Password"
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              disabled={submitting}
              helperText="Share this with the advisor securely. At least 8 characters."
              fullWidth
            />
            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Link to Advisor Record (optional)</InputLabel>
              <Select
                value={form.candidateId}
                label="Link to Advisor Record (optional)"
                onChange={(e) => setForm((f) => ({ ...f, candidateId: e.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {advisorCandidates.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name} ({c.leadId || c.id})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={submitting}>Close</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}>
            {submitting ? "Creating..." : "Create Advisor"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
