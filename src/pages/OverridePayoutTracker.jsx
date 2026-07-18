import { useMemo, useState, useEffect } from "react";
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
import InboxIcon from "@mui/icons-material/Inbox";
import { useCrm } from "../crmContext.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric"
  }).format(date);
};

function OverridePayoutTracker() {
  const { performanceRecords, overridePayoutRecords, saveOverridePayoutRecords, activeAdvisors: activeAdvisers, overrideRecordsDerived } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortKey, setSortKey] = useState("premium");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    overridePercent: 5,
    paymentStatus: "Pending",
    paymentDate: "",
    notes: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 8;

  const derivedOverrideRecords = overrideRecordsDerived;

  useEffect(() => {
    if (!saveOverridePayoutRecords) return;

    const currentIds = (overridePayoutRecords || []).map((record) => record.recordId).sort().join(",");
    const derivedIds = derivedOverrideRecords.map((record) => record.recordId).sort().join(",");

    if (currentIds !== derivedIds) {
      saveOverridePayoutRecords(derivedOverrideRecords);
    }
  }, [derivedOverrideRecords, saveOverridePayoutRecords, overridePayoutRecords]);

  const records = useMemo(() => {
    if ((overridePayoutRecords || []).length > 0) return overridePayoutRecords;
    return derivedOverrideRecords;
  }, [derivedOverrideRecords, overridePayoutRecords]);

  const summary = useMemo(() => {
    const totalPremium = records.reduce((sum, record) => sum + Number(record.premiumCollected || 0), 0);
    const totalOverride = records.reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);
    const avgOverridePercent = records.length ? records.reduce((sum, record) => sum + Number(record.overridePercent || 0), 0) / records.length : 0;
    const totalPaid = records.filter((record) => record.paymentStatus === "Paid").reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);
    const totalPending = records.filter((record) => record.paymentStatus === "Pending").reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);

    return {
      totalPremium,
      totalOverride,
      avgOverridePercent,
      totalPaid,
      totalPending,
      outstanding: totalPending
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = records.filter((record) => {
      const matchesSearch = !normalizedSearch || record.advisorName.toLowerCase().includes(normalizedSearch);
      const matchesMonth = selectedMonth === "All" || record.month === selectedMonth;
      const matchesStatus = selectedStatus === "All" || record.paymentStatus === selectedStatus;
      return matchesSearch && matchesMonth && matchesStatus;
    });

    if (sortKey === "premium") {
      result = [...result].sort((a, b) => b.premiumCollected - a.premiumCollected);
    }
    if (sortKey === "override") {
      result = [...result].sort((a, b) => b.overrideEarned - a.overrideEarned);
    }
    if (sortKey === "month") {
      result = [...result].sort((a, b) => a.month.localeCompare(b.month));
    }

    return result;
  }, [records, searchTerm, selectedMonth, selectedStatus, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const monthOptions = ["All", ...Array.from(new Set(records.map((record) => record.month).filter(Boolean)))];

  const openEditModal = (record) => {
    setEditingId(record.id);
    setFormData({
      overridePercent: record.overridePercent,
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate || "",
      notes: record.notes || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({ overridePercent: 5, paymentStatus: "Pending", paymentDate: "", notes: "" });
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingId || !saveOverridePayoutRecords) return;

    const nextValue = Number(formData.overridePercent || 0);
    const updatedRecords = overridePayoutRecords.map((record) =>
      record.id === editingId
        ? {
            ...record,
            overridePercent: nextValue,
            overrideEarned: Number(record.premiumCollected || 0) * (nextValue / 100),
            paymentStatus: formData.paymentStatus,
            paymentDate: formData.paymentStatus === "Paid" ? formData.paymentDate : "",
            notes: formData.notes
          }
        : record
    );
    await saveOverridePayoutRecords(updatedRecords);
    closeModal();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Override & Payout Tracker</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Override earnings and payment status calculated from advisor performance and linked to active advisors.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {[
          { label: "Premium Collected", value: formatCurrency(summary.totalPremium) },
          { label: "Override %", value: `${summary.avgOverridePercent.toFixed(1)}%` },
          { label: "Override Earned", value: formatCurrency(summary.totalOverride) },
          { label: "Outstanding Amount", value: formatCurrency(summary.outstanding) },
          { label: "Total Paid", value: formatCurrency(summary.totalPaid) },
          { label: "Pending Amount", value: formatCurrency(summary.totalPending) }
        ].map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField size="small" placeholder="Search advisor" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="month-filter">Month</InputLabel>
            <Select labelId="month-filter" value={selectedMonth} label="Month" onChange={(event) => { setSelectedMonth(event.target.value); setPage(1); }}>
              {monthOptions.map((option) => (
                <MenuItem key={option} value={option}>{option === "All" ? "All months" : formatMonth(option)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter">Status</InputLabel>
            <Select labelId="status-filter" value={selectedStatus} label="Status" onChange={(event) => { setSelectedStatus(event.target.value); setPage(1); }}>
              <MenuItem value="All">All statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="sort-filter">Sort By</InputLabel>
            <Select labelId="sort-filter" value={sortKey} label="Sort By" onChange={(event) => setSortKey(event.target.value)}>
              <MenuItem value="premium">Premium Collected</MenuItem>
              <MenuItem value="override">Override Earned</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Advisor</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Premium</TableCell>
                <TableCell>Override %</TableCell>
                <TableCell>Override Earned</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                      <InboxIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {records.length === 0 ? "No override records yet. Add performance data to generate overrides." : "No records match your filters."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pageRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.advisorName}</Typography>
                        <Typography variant="caption" color="text.secondary">{record.advisorCode}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatMonth(record.month)}</TableCell>
                    <TableCell>{formatCurrency(record.premiumCollected)}</TableCell>
                    <TableCell>{record.overridePercent}%</TableCell>
                    <TableCell>{formatCurrency(record.overrideEarned)}</TableCell>
                    <TableCell><Chip label={record.paymentStatus} color={record.paymentStatus === "Paid" ? "success" : "warning"} size="small" /></TableCell>
                    <TableCell>{record.paymentDate || "—"}</TableCell>
                    <TableCell>{record.notes || "—"}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => openEditModal(record)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <Button size="small" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Override Record</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="Override %" name="overridePercent" type="number" value={formData.overridePercent} onChange={handleFormChange} fullWidth required />
              <FormControl fullWidth>
                <InputLabel id="payment-status">Payment Status</InputLabel>
                <Select labelId="payment-status" label="Payment Status" name="paymentStatus" value={formData.paymentStatus} onChange={handleFormChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Payment Date" name="paymentDate" type="date" value={formData.paymentDate} onChange={handleFormChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Remarks" name="notes" value={formData.notes} onChange={handleFormChange} multiline minRows={3} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OverridePayoutTracker;
