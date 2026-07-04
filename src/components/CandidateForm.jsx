import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useCrm } from "../crmContext.jsx";
import { sources } from "../config";

const trainingStatuses = ["Pending", "In Progress", "Completed"];
const examResults = ["Pending", "Passed", "Failed"];

const shouldShowFollowUpDate = (stage) => ["Contacted", "Documents Submitted"].includes(stage);
const shouldShowTrainingStatus = (stage) => ["Training"].includes(stage);
const shouldShowExamResult = (stage) => ["Exam Result"].includes(stage);

const createEmptyForm = (stage = "Sourced") => ({
  name: "",
  phone: "",
  email: "",
  city: "",
  qualification: "",
  source: "",
  stage,
  followUpDate: "",
  trainingStatus: "Pending",
  examResult: "Pending",
  notes: ""
});

export default function CandidateForm({ open, onClose, onAdd }) {
  const { pipelineStages } = useCrm();
  const [form, setForm] = useState(() => createEmptyForm(pipelineStages[0] || "Sourced"));
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(createEmptyForm(pipelineStages[0] || "Sourced"));
      setErrors({});
      setSuccessMessage("");
    }
  }, [open, pipelineStages]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone Number is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!form.source) newErrors.source = "Source is required";
    if (!form.stage) newErrors.stage = "Recruitment Stage is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    onAdd({
      ...form,
      stage: form.stage || pipelineStages[0] || "Sourced",
      source: form.source || "Referral"
    });

    setSuccessMessage("Candidate added successfully!");
    setForm(createEmptyForm(pipelineStages[0] || "Sourced"));
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Candidate</DialogTitle>
      <DialogContent>
        {successMessage && (
          <Alert severity="success" style={{ marginBottom: "16px" }}>
            {successMessage}
          </Alert>
        )}
        
        <TextField
          fullWidth
          margin="dense"
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handle}
          error={!!errors.name}
          helperText={errors.name}
        />
        
        <TextField
          fullWidth
          margin="dense"
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handle}
          error={!!errors.phone}
          helperText={errors.phone}
        />
        
        <TextField
          fullWidth
          margin="dense"
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          error={!!errors.email}
          helperText={errors.email}
        />
        
        <TextField
          fullWidth
          margin="dense"
          label="City"
          name="city"
          value={form.city}
          onChange={handle}
          error={!!errors.city}
          helperText={errors.city}
        />
        
        <TextField
          fullWidth
          margin="dense"
          label="Qualification"
          name="qualification"
          value={form.qualification}
          onChange={handle}
          error={!!errors.qualification}
          helperText={errors.qualification}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Source"
          name="source"
          value={form.source}
          onChange={handle}
          error={!!errors.source}
          helperText={errors.source}
        >
          {sources.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="Recruitment Stage"
          name="stage"
          value={form.stage}
          onChange={handle}
          error={!!errors.stage}
          helperText={errors.stage}
        >
          {pipelineStages.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {shouldShowFollowUpDate(form.stage) && (
          <TextField
            fullWidth
            margin="dense"
            label="Follow-up Date"
            name="followUpDate"
            type="date"
            value={form.followUpDate}
            onChange={handle}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {shouldShowTrainingStatus(form.stage) && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Training Status"
            name="trainingStatus"
            value={form.trainingStatus}
            onChange={handle}
          >
            {trainingStatuses.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}

        {shouldShowExamResult(form.stage) && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Exam Result"
            name="examResult"
            value={form.examResult}
            onChange={handle}
          >
            {examResults.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          fullWidth
          margin="dense"
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handle}
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={!!successMessage}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={submit}
          disabled={!!successMessage}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
