import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Clear as ClearIcon,
  Inbox as InboxIcon,
} from "@mui/icons-material";
import { useCrm } from "../../crmContext.jsx";
import { advisorWorkflowStages, stageBadge } from "../../data/dropdowns.js";

const STATUSES = ["Active", "Inactive"];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

export default function AdvisorRecruitment() {
  const { candidates = [] } = useCrm();

  const advisorRecords = useMemo(
    () =>
      candidates.filter(
        (c) => c.leadType === "Advisor" || c.leadType === "Recruitment"
      ),
    [candidates]
  );

  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const sources = useMemo(() => {
    const set = new Set();
    advisorRecords.forEach((r) => {
      if (r.source) set.add(r.source);
    });
    return [...set].sort();
  }, [advisorRecords]);

  const filtered = useMemo(() => {
    let result = [...advisorRecords];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q) ||
          r.mobile?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.source?.toLowerCase().includes(q)
      );
    }

    if (filterStage !== "All") {
      result = result.filter((r) => r.recruitmentStage === filterStage);
    }
    if (filterStatus !== "All") {
      result = result.filter((r) => r.status === filterStatus);
    }
    if (filterSource !== "All") {
      result = result.filter((r) => r.source === filterSource);
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === "name") {
        valA = (a.name || "").toLowerCase();
        valB = (b.name || "").toLowerCase();
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (sortBy === "recruitmentStage") {
        const stages = advisorWorkflowStages;
        valA = stages.indexOf(a.recruitmentStage || "");
        valB = stages.indexOf(b.recruitmentStage || "");
      } else {
        valA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [
    advisorRecords,
    search,
    filterStage,
    filterStatus,
    filterSource,
    sortBy,
    sortDir,
  ]);

  const paged = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
    setPage(0);
  };

  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return null;
    return (
      <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </Typography>
    );
  };

  const statusColor = (status) =>
    status === "Active" ? "success" : "default";

  const stageColor = (stage) => stageBadge?.[stage]?.color || "default";

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text || "");
    setSnackbar({
      open: true,
      message: "Copied to clipboard",
      severity: "success",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStage("All");
    setFilterStatus("All");
    setFilterSource("All");
    setPage(0);
  };

  const hasActiveFilters =
    search ||
    filterStage !== "All" ||
    filterStatus !== "All" ||
    filterSource !== "All";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
          Advisor Recruitment
        </Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Manage all advisor recruitment records
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              size="small"
              placeholder="Search by Name, Lead ID, Mobile, Email, Source..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 300 }}
            />
            <TextField
              size="small"
              select
              label="Recruitment Stage"
              value={filterStage}
              onChange={(e) => {
                setFilterStage(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="All">All Stages</MenuItem>
              {advisorWorkflowStages.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="All">All</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              select
              label="Lead Source"
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="All">All Sources</MenuItem>
              {sources.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <IconButton size="small" onClick={clearFilters}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ px: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filtered.length} record
            {filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell>Lead ID</TableCell>
                <TableCell
                  onClick={() => handleSort("name")}
                  sx={{ cursor: "pointer" }}
                >
                  Advisor Name <SortIndicator field="name" />
                </TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Lead Source</TableCell>
                <TableCell
                  onClick={() => handleSort("recruitmentStage")}
                  sx={{ cursor: "pointer" }}
                >
                  Recruitment Stage <SortIndicator field="recruitmentStage" />
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell
                  onClick={() => handleSort("followUpDate")}
                  sx={{ cursor: "pointer" }}
                >
                  Follow-up Date <SortIndicator field="followUpDate" />
                </TableCell>
                <TableCell
                  onClick={() => handleSort("updatedAt")}
                  sx={{ cursor: "pointer" }}
                >
                  Last Updated <SortIndicator field="updatedAt" />
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 6,
                      }}
                    >
                      <InboxIcon
                        sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#64748b" }}
                      >
                        No advisor recruitment records found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hasActiveFilters
                          ? "Try adjusting your filters."
                          : "Records will appear here once added."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Click to copy Lead ID">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyText(a.id)}
                            sx={{ p: 0 }}
                          >
                            <ContentCopyIcon
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                cursor: "pointer",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontFamily: "monospace" }}
                        >
                          {a.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {a.name || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Click to copy Mobile">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyText(a.mobile)}
                            sx={{ p: 0 }}
                          >
                            <ContentCopyIcon
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                cursor: "pointer",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                        {a.mobile || ""}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Click to copy Email">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyText(a.email)}
                            sx={{ p: 0 }}
                          >
                            <ContentCopyIcon
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                cursor: "pointer",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                        {a.email || ""}
                      </Box>
                    </TableCell>
                    <TableCell>{a.city || ""}</TableCell>
                    <TableCell>{a.source || ""}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.recruitmentStage || "New Lead"}
                        size="small"
                        color={stageColor(a.recruitmentStage)}
                        variant="outlined"
                        sx={{ borderRadius: "16px", fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.status || "Active"}
                        size="small"
                        color={statusColor(a.status)}
                        variant="outlined"
                        sx={{ borderRadius: "16px", fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {a.followUpDate
                          ? new Date(a.followUpDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "\u2014"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {a.updatedAt
                          ? new Date(a.updatedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "\u2014"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Link className="button secondary" to={`/adviser/lead-management/lead/${a.id}`}>View</Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
