import { useMemo, useState } from "react";
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
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import InboxIcon from "@mui/icons-material/Inbox";
import { useCrm } from "../crmContext.jsx";

const defaultForm = (adviser) => ({
  advisorName: adviser?.name || "",
  advisorCode: adviser?.advisorCode || "",
  month: "",
  policiesSold: "",
  premiumCollected: "",
  persistency: "",
  monthlyTarget: "",
  remarks: ""
});

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

function getAchievement(record) {
  const premium = Number(record?.premiumCollected || 0);
  const target = Number(record?.monthlyTarget || 0);
  if (!target) return 0;
  return (premium / target) * 100;
}

function PerformanceTracker() {
  const { performanceRecords, addPerformanceRecord, activeAdvisors: adviserRows, performanceSummary: summary } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [sortKey, setSortKey] = useState("premium");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAdviser, setActiveAdviser] = useState(null);
  const [formData, setFormData] = useState(defaultForm(null));

  const pageSize = 8;

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = adviserRows.filter((row) => {
      const matchesSearch = !normalizedSearch || row.name.toLowerCase().includes(normalizedSearch) || row.advisorCode.toLowerCase().includes(normalizedSearch);
      const matchesMonth = selectedMonth === "All" || (row.performance?.month || "") === selectedMonth;
      return matchesSearch && matchesMonth;
    });

    if (sortKey === "premium") {
      result = [...result].sort((a, b) => Number(b.performance?.premiumCollected || 0) - Number(a.performance?.premiumCollected || 0));
    }
    if (sortKey === "policies") {
      result = [...result].sort((a, b) => Number(b.performance?.policiesSold || 0) - Number(a.performance?.policiesSold || 0));
    }
    if (sortKey === "achievement") {
      result = [...result].sort((a, b) => getAchievement(b.performance || {}) - getAchievement(a.performance || {}));
    }

    return result;
  }, [adviserRows, searchTerm, selectedMonth, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const monthOptions = ["All", ...Array.from(new Set(adviserRows.map((row) => row.performance?.month).filter(Boolean)))];

  const premiumTrend = useMemo(() => {
    const relevantRecords = performanceRecords.filter((record) => adviserRows.some((row) => row.advisorCode === record.advisorCode || row.name === record.advisorName));
    const grouped = new Map();
    relevantRecords.forEach((record) => {
      const existing = grouped.get(record.month) || { month: record.month, premium: 0, policies: 0 };
      existing.premium += Number(record.premiumCollected || 0);
      existing.policies += Number(record.policiesSold || 0);
      grouped.set(record.month, existing);
    });
    return Array.from(grouped.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [adviserRows, performanceRecords]);

  const rankingData = useMemo(() => {
    return adviserRows
      .map((row) => ({
        name: row.name,
        premium: Number(row.performance?.premiumCollected || 0),
        policies: Number(row.performance?.policiesSold || 0)
      }))
      .sort((a, b) => b.premium - a.premium)
      .slice(0, 8);
  }, [adviserRows]);

  const openUpdateModal = (adviser) => {
    const currentRecord = performanceRecords.find((record) => record.advisorCode === adviser.advisorCode || record.advisorName === adviser.name);
    setActiveAdviser(adviser);
    setFormData(
      currentRecord
        ? {
            advisorName: currentRecord.advisorName,
            advisorCode: currentRecord.advisorCode,
            month: currentRecord.month,
            policiesSold: currentRecord.policiesSold,
            premiumCollected: currentRecord.premiumCollected,
            persistency: currentRecord.persistency,
            monthlyTarget: currentRecord.monthlyTarget,
            remarks: currentRecord.remarks
          }
        : defaultForm(adviser)
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveAdviser(null);
    setFormData(defaultForm(null));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeAdviser) return;

    const payload = {
      adviserId: activeAdviser.id,
      advisorName: activeAdviser.name,
      advisorCode: activeAdviser.advisorCode,
      month: formData.month,
      policiesSold: Number(formData.policiesSold || 0),
      premiumCollected: Number(formData.premiumCollected || 0),
      persistency: Number(formData.persistency || 0),
      monthlyTarget: Number(formData.monthlyTarget || 0),
      remarks: formData.remarks
    };

    await addPerformanceRecord(payload);
    closeModal();
    setPage(1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>Performance Tracker</Typography>
        <Typography variant="body1" sx={{ color: "#475569" }}>
          Live production metrics for all active advisors, calculated from the advisor directory and performance history.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {[
          { label: "Total Active Advisors", value: summary.activeAdvisors },
          { label: "Policies Sold", value: summary.totalPolicies },
          { label: "Premium Collected", value: formatCurrency(summary.totalPremium) },
          { label: "Average Persistency", value: `${summary.averagePersistency.toFixed(1)}%` },
          { label: "Average Achievement", value: `${summary.averageAchievement.toFixed(1)}%` },
          { label: "Best Performer", value: summary.bestPerformer?.name || "—" },
          { label: "Monthly Target Achievement", value: `${summary.monthlyTargetAchievement.toFixed(1)}%` }
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Monthly Premium Trend</Typography>
            {premiumTrend.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                <InboxIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#64748b" }}>No trend data</Typography>
                <Typography variant="body2" color="text.secondary">Add performance records to see trends.</Typography>
              </Box>
            ) : (
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={premiumTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(value) => formatMonth(value)} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="premium" stroke="#2563eb" strokeWidth={2} name="Premium" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Policies Sold Trend</Typography>
            {premiumTrend.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                <InboxIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#64748b" }}>No trend data</Typography>
                <Typography variant="body2" color="text.secondary">Add performance records to see trends.</Typography>
              </Box>
            ) : (
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={premiumTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(value) => formatMonth(value)} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="policies" fill="#0f766e" name="Policies" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Advisor Ranking</Typography>
            {rankingData.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                <InboxIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#64748b" }}>No rankings yet</Typography>
                <Typography variant="body2" color="text.secondary">Performance data will populate rankings.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {rankingData.map((row, index) => (
                  <Box key={row.name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.2, borderRadius: 2, bgcolor: index === 0 ? "#eff6ff" : "#f8fafc" }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{index + 1}. {row.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.policies} policies • {formatCurrency(row.premium)}</Typography>
                    </Box>
                    <Chip label={index === 0 ? "Top" : "Ranked"} size="small" color={index === 0 ? "primary" : "default"} />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Performance Table</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search advisor"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="month-filter">Month</InputLabel>
                <Select labelId="month-filter" value={selectedMonth} label="Month" onChange={(event) => { setSelectedMonth(event.target.value); setPage(1); }}>
                  {monthOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option === "All" ? "All months" : formatMonth(option)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-filter">Sort By</InputLabel>
                <Select labelId="sort-filter" value={sortKey} label="Sort By" onChange={(event) => setSortKey(event.target.value)}>
                  <MenuItem value="premium">Premium Collected</MenuItem>
                  <MenuItem value="policies">Policies Sold</MenuItem>
                  <MenuItem value="achievement">Achievement %</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Advisor</TableCell>
                    <TableCell>Policies</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Achievement</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                          <InboxIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">No records match your filters.</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.advisorCode}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{row.performance?.policiesSold ?? 0}</TableCell>
                        <TableCell>{formatCurrency(row.performance?.premiumCollected || 0)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: getAchievement(row.performance || {}) >= 100 ? "#16a34a" : getAchievement(row.performance || {}) >= 70 ? "#2563eb" : "#d97706" }}>
                            {getAchievement(row.performance || {}).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small" onClick={() => openUpdateModal(row)}>
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button size="small" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Performance Record</DialogTitle>
        <DialogContent dividers>
          {activeAdviser && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Advisor Name" name="advisorName" value={formData.advisorName} InputProps={{ readOnly: true }} fullWidth />
                <TextField label="Advisor Code" name="advisorCode" value={formData.advisorCode} InputProps={{ readOnly: true }} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Month" name="month" type="month" value={formData.month} onChange={handleFormChange} fullWidth required />
                <TextField label="Policies Sold" name="policiesSold" type="number" value={formData.policiesSold} onChange={handleFormChange} fullWidth required />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Premium Collected" name="premiumCollected" type="number" value={formData.premiumCollected} onChange={handleFormChange} fullWidth required />
                <TextField label="Persistency %" name="persistency" type="number" value={formData.persistency} onChange={handleFormChange} fullWidth required />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Monthly Target" name="monthlyTarget" type="number" value={formData.monthlyTarget} onChange={handleFormChange} fullWidth required />
                <TextField label="Achievement %" value={getAchievement({ premiumCollected: Number(formData.premiumCollected || 0), monthlyTarget: Number(formData.monthlyTarget || 0) }).toFixed(1)} InputProps={{ readOnly: true }} fullWidth />
              </Stack>
              <TextField label="Remarks" name="remarks" multiline minRows={3} value={formData.remarks} onChange={handleFormChange} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PerformanceTracker;
