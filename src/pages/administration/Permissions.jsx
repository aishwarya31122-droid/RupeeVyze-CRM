import { useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useCrm } from "../../crmContext.jsx";

export default function Permissions() {
  const { permissions: contextPermissions } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");

  const allPermissions = useMemo(() => contextPermissions || [], [contextPermissions]);
  const filteredPermissions = useMemo(() => allPermissions.filter((permission) => !searchTerm || permission.feature.toLowerCase().includes(searchTerm.toLowerCase()) || permission.role.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm, allPermissions]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Permissions Matrix</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>Application feature access and role-based permissions overview.</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1 }}><LockIcon fontSize="small" /></Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Configured Access</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{allPermissions.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <TextField size="small" placeholder="Search feature or role" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} sx={{ minWidth: 280 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Access</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPermissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: "center", py: 4, color: "#64748b" }}>No records found</TableCell>
                </TableRow>
              ) : (
                filteredPermissions.map((permission) => (
                  <TableRow key={`${permission.feature}-${permission.role}`} hover>
                    <TableCell>{permission.feature}</TableCell>
                    <TableCell>{permission.role}</TableCell>
                    <TableCell><Chip label={permission.access} size="small" color="info" /></TableCell>
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
