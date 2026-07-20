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

const createEmptyForm = (workflowStage = "New Lead") => ({
  name: "",
  mobile: "",
  email: "",
  city: "",
  source: "",
  qualification: "",
  leadType: "Insurance Customer",
  workflowStage,
  followUpDate: "",
  notes: ""
});

export default function CandidateForm({ open, onClose, onAdd, pipelineStages: propPipelineStages, sources: propSources }) {
  const { customerWorkflowStages, followUpRequiredStages, sources: contextSources } = useCrm();
  const sources = propSources || contextSources;
  const [form, setForm] = useState(() => createEmptyForm("New Lead"));
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(createEmptyForm("New Lead"));
      setErrors({});
      setSuccessMessage("");
    }
  }, [open]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const showFollowUp = followUpRequiredStages.has(form.workflowStage);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile Number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) newErrors.mobile = "Enter a valid 10-digit phone number.";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.qualification.trim()) newErrors.qualification = "Qualification is required.";
    if (!form.source) newErrors.source = "Source is required";
    if (!form.workflowStage) newErrors.workflowStage = "Insurance Stage is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      await onAdd({
        ...form,
        leadType: "Insurance Customer",
        workflowStage: form.workflowStage || "New Lead",
        source: form.source || "Referral",
        nextFollowUp: showFollowUp ? (form.followUpDate || "") : ""
      });

      setSuccessMessage("Lead added successfully!");
      setForm(createEmptyForm("New Lead"));
      setErrors({});
      onClose();
    } catch {
      setErrors((prev) => ({ ...prev, name: "This record already exists." }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Lead</DialogTitle>
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
          label="Mobile Number"
          name="mobile"
          value={form.mobile}
          onChange={handle}
          error={!!errors.mobile}
          helperText={errors.mobile}
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
          label="Insurance Stage"
          name="workflowStage"
          value={form.workflowStage}
          onChange={(e) => setForm((prev) => ({ ...prev, workflowStage: e.target.value }))}
          error={!!errors.workflowStage}
          helperText={errors.workflowStage}
        >
          {customerWorkflowStages.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {showFollowUp && (
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
          Save Lead
        </Button>
      </DialogActions>
    </Dialog>
  );
}
