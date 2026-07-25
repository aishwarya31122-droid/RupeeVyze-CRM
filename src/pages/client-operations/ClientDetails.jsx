import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useCrm } from "../../crmContext.jsx";
import { useAuth } from "../../authContext.jsx";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates: allCandidates, activeAdvisors, updateCandidate } = useCrm();
  const { currentUser, isAdmin, isAdvisor } = useAuth();
  const [editing, setEditing] = useState(false);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  const candidate = useMemo(() => (allCandidates || []).find((c) => String(c.id) === String(id) || String(c.leadId) === String(id)), [allCandidates, id]);

  const client = useMemo(() => {
    if (!candidate) return null;
    return {
      candidateId: String(candidate.id),
      clientId: candidate.leadId || `LD-${candidate.id}`,
      name: candidate.name || "",
      mobile: candidate.mobile || candidate.phone || "",
      city: candidate.city || "",
      email: candidate.email || "",
      advisorAssigned: candidate.assignedAdvisorName || candidate.assignedTo || "",
      assignedAdvisorId: candidate.assignedAdvisorId || "",
      finalStatus: candidate.leadStatus || "Active Client",
      leadSource: candidate.leadSource || candidate.source || "",
      policyTypeInterest: candidate.policyTypeInterest || "",
      nextFollowUpDate: candidate.nextFollowUp || "",
      followUpStatus: candidate.followUp?.status || "",
      policyIssued: candidate.policyIssued || false,
      kycStarted: candidate.kycStarted || false,
      activity: candidate.activities || [],
      priority: candidate.priority || "Medium",
      dateReceived: candidate.createdDate || ""
    };
  }, [candidate]);

  const hasAccess = useMemo(() => {
    if (!client) return false;
    if (isAdmin) return true;
    if (isAdvisor) {
      return client.assignedAdvisorId === currentUser?.id;
    }
    return true;
  }, [client, isAdmin, isAdvisor, currentUser]);

  if (!client || !hasAccess) {
    return (
      <Box sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#fff" }}>
        <Typography variant="h6">{!client ? "Client not found" : "Access Denied"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{!client ? "" : "You do not have permission to view this client."}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/adviser/client-operations/clients")}>Back to Clients</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>{client.name}</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>{client.clientId || client.id} • {client.city}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate("/adviser/client-operations/clients")}>Back to Clients</Button>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <Box sx={{ bgcolor: "#2563eb15", color: "#2563eb", borderRadius: "50%", p: 1.5 }}>
              <PersonIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{client.name}</Typography>
              <Typography variant="body2" color="text.secondary">Primary contact and servicing overview</Typography>
            </Box>
            <Chip label={client.finalStatus || "Active Client"} color={client.finalStatus === "Active Client" ? "success" : client.finalStatus === "Lost" ? "error" : "info"} />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Client Profile</Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2"><strong>Mobile:</strong> {client.mobile}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {client.email || "—"}</Typography>
                <Typography variant="body2"><strong>Advisor:</strong> {editing ? "" : (client.advisorAssigned || "Unassigned")}</Typography>
                {editing && (
                  <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                    <InputLabel>Assigned To</InputLabel>
                    <Select
                      value={selectedAdvisorId}
                      label="Assigned To"
                      onChange={(e) => setSelectedAdvisorId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>None (Unassigned)</em>
                      </MenuItem>
                      {activeAdvisors.map((advisor) => (
                        <MenuItem key={advisor.id} value={String(advisor.id)}>
                          {advisor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Typography variant="body2"><strong>Lead Source:</strong> {client.leadSource}</Typography>
                <Typography variant="body2"><strong>Interest:</strong> {client.policyTypeInterest}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {isAdmin && (editing ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={async () => {
                        const advisor = activeAdvisors.find((a) => String(a.id) === String(selectedAdvisorId));
                        await updateCandidate(candidate.id, {
                          assignedAdvisorId: advisor ? String(advisor.id) : "",
                          assignedAdvisorName: advisor ? advisor.name : "",
                        });
                        setEditing(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => {
                    setSelectedAdvisorId(client.assignedAdvisorId || "");
                    setEditing(true);
                  }}>
                    Edit
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Service Signals</Typography>
              <Stack spacing={0.75}>
                <Typography variant="body2"><strong>Next Follow-up:</strong> {client.nextFollowUpDate}</Typography>
                <Typography variant="body2"><strong>Follow-up Status:</strong> {client.followUpStatus}</Typography>
                <Typography variant="body2"><strong>Policy Issued:</strong> {client.policyIssued ? "Yes" : "No"}</Typography>
                <Typography variant="body2"><strong>KYC Started:</strong> {client.kycStarted ? "Yes" : "No"}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Activity</Typography>
          <Stack spacing={1}>
            {(client.activity || []).map((item, index) => (
              <Box key={`${item.text || item.label || index}-${index}`} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.25, borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Typography variant="body2">{item.text || item.label || ""}</Typography>
                <Typography variant="caption" color="text.secondary">{item.time || item.date || ""}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
