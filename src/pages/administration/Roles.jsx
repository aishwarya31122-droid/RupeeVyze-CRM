import { useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

const roles = [
  { name: "Admin", scope: "Full access", team: "Executive", status: "Active" },
  { name: "Recruiter", scope: "Lead management", team: "Sales", status: "Active" },
  { name: "Manager", scope: "Team oversight", team: "Operations", status: "Active" },
  { name: "Advisor", scope: "Client servicing", team: "Field", status: "Active" }
];

export default function Roles() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredRoles = useMemo(() => roles.filter((role) => !searchTerm || role.name.toLowerCase().includes(searchTerm.toLowerCase()) || role.scope.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

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
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{roles.length}</Typography>
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
              {filteredRoles.map((role) => (
                <TableRow key={role.name} hover>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.scope}</TableCell>
                  <TableCell>{role.team}</TableCell>
                  <TableCell><Chip label={role.status} size="small" color="success" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
