import React from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";

export default function PolicyDetailsForm({ form, handleChange, validationErrors, policyExpanded, setPolicyExpanded }) {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        select
        fullWidth
        label="Policy Issued"
        name="policyIssued"
        value={form.policyIssued}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <MenuItem value="No">No</MenuItem>
        <MenuItem value="Yes">Yes</MenuItem>
      </TextField>

      <Collapse in={form.policyIssued === "Yes"}>
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
              mb: policyExpanded ? 2.5 : 0,
            }}
            onClick={() => setPolicyExpanded((p) => !p)}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: "1rem" }}>
              Policy Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {policyExpanded ? "Collapse" : "Expand"}
            </Typography>
          </Box>
          <Collapse in={policyExpanded}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number *"
                  name="policyNumber"
                  value={form.policyNumber}
                  onChange={handleChange}
                  error={!!validationErrors.policyNumber}
                  helperText={validationErrors.policyNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Company *"
                  name="insuranceCompany"
                  value={form.insuranceCompany}
                  onChange={handleChange}
                  error={!!validationErrors.insuranceCompany}
                  helperText={validationErrors.insuranceCompany}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Type *"
                  name="policyType"
                  value={form.policyType}
                  onChange={handleChange}
                  error={!!validationErrors.policyType}
                  helperText={validationErrors.policyType}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Premium Frequency *"
                  name="premiumFrequency"
                  value={form.premiumFrequency}
                  onChange={handleChange}
                  error={!!validationErrors.premiumFrequency}
                  helperText={validationErrors.premiumFrequency}
                >
                  <MenuItem value="">Select...</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Half Yearly">Half Yearly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="Single Premium">Single Premium</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Start Date *"
                  type="date"
                  name="policyStartDate"
                  value={form.policyStartDate}
                  onChange={handleChange}
                  error={!!validationErrors.policyStartDate}
                  helperText={validationErrors.policyStartDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy End Date *"
                  type="date"
                  name="policyEndDate"
                  value={form.policyEndDate}
                  onChange={handleChange}
                  error={!!validationErrors.policyEndDate}
                  helperText={validationErrors.policyEndDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sum Assured *"
                  name="sumAssured"
                  value={form.sumAssured}
                  onChange={handleChange}
                  error={!!validationErrors.sumAssured}
                  helperText={validationErrors.sumAssured}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nominee Name *"
                  name="nomineeName"
                  value={form.nomineeName}
                  onChange={handleChange}
                  error={!!validationErrors.nomineeName}
                  helperText={validationErrors.nomineeName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="policyRemarks"
                  value={form.policyRemarks}
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
