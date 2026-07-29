import React from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";

export default function PremiumDetailsForm({ form, handleChange, validationErrors, premiumExpanded, setPremiumExpanded }) {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        select
        fullWidth
        label="Premium Collected"
        name="premiumCollected"
        value={form.premiumCollected}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <MenuItem value="No">No</MenuItem>
        <MenuItem value="Yes">Yes</MenuItem>
      </TextField>

      <Collapse in={form.premiumCollected === "Yes"}>
        <Box
          sx={{
            bgcolor: "#f8fafc",
            borderRadius: 2,
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              userSelect: "none",
              mb: premiumExpanded ? 2.5 : 0,
            }}
            onClick={() => setPremiumExpanded((p) => !p)}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: "1rem" }}>
              Premium Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {premiumExpanded ? "Collapse" : "Expand"}
            </Typography>
          </Box>
          <Collapse in={premiumExpanded}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Premium Amount *"
                  name="premiumAmount"
                  value={form.premiumAmount}
                  onChange={handleChange}
                  error={!!validationErrors.premiumAmount}
                  helperText={validationErrors.premiumAmount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Collection Date *"
                  type="date"
                  name="collectionDate"
                  value={form.collectionDate}
                  onChange={handleChange}
                  error={!!validationErrors.collectionDate}
                  helperText={validationErrors.collectionDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Payment Mode *"
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  error={!!validationErrors.paymentMode}
                  helperText={validationErrors.paymentMode}
                >
                  <MenuItem value="">Select...</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Debit Card">Debit Card</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transaction ID *"
                  name="transactionReference"
                  value={form.transactionReference}
                  onChange={handleChange}
                  error={!!validationErrors.transactionReference}
                  helperText={validationErrors.transactionReference}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Receipt Number"
                  name="receiptNumber"
                  value={form.receiptNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Collected By"
                  name="collectedBy"
                  value={form.collectedBy}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="premiumRemarks"
                  value={form.premiumRemarks}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Collapse>
    </Box>
  );
}
