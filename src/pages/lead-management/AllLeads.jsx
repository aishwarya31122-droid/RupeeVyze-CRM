import React from "react";
import { Link } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";

function AllLeads({ leads = [] }) {
  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>All Leads</Typography>
          <Typography variant="body1" sx={{ color: "#475569" }}>
            Table of all leads (advisor + client).
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
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
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>No records found</td>
                </tr>
              ) : (
                leads.map((l) => (
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
    </div>
  );
}

export default AllLeads;
