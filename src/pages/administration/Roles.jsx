import { useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import { useCrm } from "../../crmContext.jsx";

export default function Roles() {
  const { roles: contextRoles } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");

  const allRoles = useMemo(() => contextRoles || [], [contextRoles]);
  const filteredRoles = useMemo(() => allRoles.filter((role) => !searchTerm || role.name.toLowerCase().includes(searchTerm.toLowerCase()) || role.scope.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, allRoles]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Role Governance</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>Manage role definitions and aligned access responsibilities.</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1 }}><SecurityIcon fontSize="small" /></Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Defined Roles</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{allRoles.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <TextField size="small" placeholder="Search roles" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No records found</TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.name} hover>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.scope}</TableCell>
                    <TableCell>{Array.isArray(role.team) ? role.team.join(", ") : role.team}</TableCell>
                    <TableCell><Chip label={role.status} size="small" color="success" /></TableCell>
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
