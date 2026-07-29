import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, Divider, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useCrm } from "../../crmContext.jsx";
import { useAuth } from "../../authContext.jsx";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates: allCandidates, activeAdvisors, updateCandidate } = useCrm();
  const { currentUser, isAdmin, isAdvisor, canAssignClient } = useAuth();
  const [editing, setEditing] = useState(false);
  const [selectedAdvisorName, setSelectedAdvisorName] = useState("");
  const [manualAssignedTo, setManualAssignedTo] = useState("");

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
      return String(client.assignedAdvisorId || "") === String(currentUser?.id || "");
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
                  <>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Select Active Advisor"
                      value={selectedAdvisorName}
                      onChange={(e) => setSelectedAdvisorName(e.target.value)}
                      sx={{ mt: 0.5, mb: 1 }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {activeAdvisors.map((advisor) => (
                        <MenuItem key={advisor.id} value={advisor.name}>
                          {advisor.name}{advisor.advisorCode ? ` (${advisor.advisorCode})` : ""}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      size="small"
                      label="Enter Advisor Name Manually"
                      placeholder="Enter advisor name manually"
                      value={manualAssignedTo}
                      onChange={(e) => setManualAssignedTo(e.target.value)}
                    />
                  </>
                )}
                <Typography variant="body2"><strong>Lead Source:</strong> {client.leadSource}</Typography>
                <Typography variant="body2"><strong>Interest:</strong> {client.policyTypeInterest}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {canAssignClient() && (editing ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={async () => {
                        const effective = manualAssignedTo.trim() !== "" ? manualAssignedTo : selectedAdvisorName;
                        const advisor = activeAdvisors.find((a) => a.name === effective);
                        await updateCandidate(candidate.id, {
                          assignedTo: effective,
                          assignedAdvisorId: advisor ? String(advisor.id) : "",
                          assignedAdvisorName: effective,
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
                    const assigned = client.advisorAssigned || "";
                    const match = activeAdvisors.some((a) => a.name === assigned);
                    setSelectedAdvisorName(match ? assigned : "");
                    setManualAssignedTo(match ? "" : assigned);
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
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Policy Details</Typography>
          {candidate.policyNumber ? (
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Policy Number:</strong> {candidate.policyNumber}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Insurance Company:</strong> {candidate.insuranceCompany || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Policy Type:</strong> {candidate.policyType || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Premium Frequency:</strong> {candidate.premiumFrequency || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Start Date:</strong> {candidate.policyStartDate || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>End Date:</strong> {candidate.policyEndDate || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Sum Assured:</strong> {candidate.sumAssured || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Nominee:</strong> {candidate.nomineeName || "—"}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Remarks:</strong> {candidate.policyRemarks || "—"}</Typography></Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">No Policy Details Available</Typography>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Premium Details</Typography>
          {candidate.premiumAmount ? (
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Premium Amount:</strong> {candidate.premiumAmount}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Collection Date:</strong> {candidate.collectionDate || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Payment Mode:</strong> {candidate.paymentMode || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Transaction ID:</strong> {candidate.transactionReference || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Receipt Number:</strong> {candidate.receiptNumber || "—"}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography variant="body2"><strong>Collected By:</strong> {candidate.collectedBy || "—"}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Remarks:</strong> {candidate.premiumRemarks || "—"}</Typography></Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">No Premium Details Available</Typography>
          )}
        </CardContent>
      </Card>

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
