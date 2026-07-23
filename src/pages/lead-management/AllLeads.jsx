import React, { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useCrm } from "../../crmContext.jsx";
import { useAuth, filterByRole } from "../../authContext.jsx";

function AllLeads() {
  const { candidates: allCandidates, removeDuplicates } = useCrm();
  const { currentUser, isAdmin } = useAuth();
  const candidates = useMemo(() => filterByRole(allCandidates, currentUser), [allCandidates, currentUser]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const insuranceLeads = useMemo(() => {
    return candidates.filter((c) => !c.leadType || c.leadType === "Insurance Customer");
  }, [candidates]);

  const handleRemoveDuplicates = useCallback(() => {
    if (insuranceLeads.length === 0) return;
    const result = window.confirm("Remove duplicate lead records? This cannot be undone.");
    if (!result) return;
    const removed = removeDuplicates();
    setSnackbar({ open: true, message: `${removed} duplicate(s) removed successfully.`, severity: "success" });
  }, [insuranceLeads, removeDuplicates]);

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Leads</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>
            Insurance customer leads.
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" startIcon={<DeleteSweepIcon />} onClick={handleRemoveDuplicates}>
              Remove Duplicates
            </Button>
          </Box>
        )}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Insurance Customer Leads ({insuranceLeads.length})
          </Typography>
        </Box>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Lead Type</th>
                <th>Workflow Stage</th>
                <th>Lead Status</th>
                <th>Assigned To</th>
                <th>Lead Source</th>
                <th>Priority</th>
                <th>Next Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {insuranceLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No insurance customer records found</td>
                </tr>
              ) : (
                insuranceLeads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.leadId}</td>
                    <td>{l.name}</td>
                    <td>{l.leadType}</td>
                    <td>{l.workflowStage}</td>
                    <td>{l.leadStatus}</td>
                    <td>{l.assignedTo}</td>
                    <td>{l.leadSource || l.source}</td>
                    <td>{l.priority || l.followUp?.priority}</td>
                    <td>{l.nextFollowUp}</td>
                    <td>
                      <Link className="button secondary" to={`/adviser/lead-management/lead/${l.id}`}>View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AllLeads;
