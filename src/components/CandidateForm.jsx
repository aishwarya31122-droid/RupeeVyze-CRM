import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useCrm } from "../crmContext.jsx";
import { useAuth } from "../authContext.jsx";
import StageForm, { getStageDefaultValues, clearHiddenStageFields } from "./StageForm.jsx";
import {
  insuranceCustomerStages,
  advisorRecruitmentStages,
  insuranceCustomerStageFields,
  advisorStageFields,
} from "../data/stageConfig.js";
import { stageStatusOptions } from "../data/dropdowns.js";

const stageConfigByLeadType = {
  "Insurance Customer": insuranceCustomerStageFields,
  Advisor: advisorStageFields,
  Recruitment: advisorStageFields,
};

const firstStageByLeadType = {
  "Insurance Customer": insuranceCustomerStages[0],
  Advisor: advisorRecruitmentStages[0],
  Recruitment: advisorRecruitmentStages[0],
};

const baseFields = {
  name: "",
  mobile: "",
  email: "",
  city: "",
  qualification: "",
  leadType: "Insurance Customer",
  workflowStage: insuranceCustomerStages[0],
  dueDate: "",
  priority: "Medium",
  notes: "",
};

const createEmptyForm = (leadType) => {
  const lt = leadType || "Insurance Customer";
  const config = stageConfigByLeadType[lt];
  const firstStage = firstStageByLeadType[lt];
  const stageDefaults = getStageDefaultValues(config, firstStage);
  return {
    ...baseFields,
    ...stageDefaults,
    leadType: lt,
    workflowStage: firstStage,
  };
};

const STAGE_FIELDS_BASE = new Set([
  "name", "mobile", "email", "city", "qualification",
  "source", "leadType", "workflowStage", "notes", "assignedTo",
  "nextFollowUp", "dueDate", "priority", "stageStatus",
]);

export default function CandidateForm({ open, onClose, onAdd, pipelineStages: propPipelineStages, sources: propSources }) {
  const { candidates, activeAdvisors } = useCrm();
  const { currentUser, isAdvisor, canAssignClient } = useAuth();
  const [form, setForm] = useState(() => createEmptyForm());
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(createEmptyForm());
      setErrors({});
      setSuccessMessage("");
    }
  }, [open]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLeadTypeChange = (e) => {
    const newLeadType = e.target.value;
    const newConfig = stageConfigByLeadType[newLeadType];
    const newFirstStage = firstStageByLeadType[newLeadType];
    setForm((prev) => {
      const cleaned = { ...prev };
      const oldConfig = stageConfigByLeadType[prev.leadType] || insuranceCustomerStageFields;
      const oldFields = Object.keys(oldConfig).reduce((acc, stage) => {
        (oldConfig[stage] || []).forEach((f) => acc.add(f.name));
        return acc;
      }, new Set());
      for (const key of Object.keys(cleaned)) {
        if (oldFields.has(key) && !STAGE_FIELDS_BASE.has(key)) {
          cleaned[key] = "";
        }
      }
      const stageDefaults = getStageDefaultValues(newConfig, newFirstStage);
      return {
        ...cleaned,
        leadType: newLeadType,
        workflowStage: newFirstStage,
        ...stageDefaults,
      };
    });
    setErrors({});
  };

  const handleStageChange = (e) => {
    const value = e.target.value;
    const config = stageConfigByLeadType[form.leadType] || insuranceCustomerStageFields;
    setForm((prev) => {
      const withDefaults = {
        ...prev,
        workflowStage: value,
        stageStatus: "",
        ...getStageDefaultValues(config, value),
      };
      return clearHiddenStageFields(withDefaults, config, value);
    });
  };

  const stageConfig = stageConfigByLeadType[form.leadType] || insuranceCustomerStageFields;
  const isInsuranceCustomer = form.leadType === "Insurance Customer";
  const visibleStages = isInsuranceCustomer ? insuranceCustomerStages : advisorRecruitmentStages;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile Number is required";
    else if (!/^\d{10}$/.test(form.mobile.trim())) newErrors.mobile = "Enter a valid 10-digit phone number.";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.qualification.trim()) newErrors.qualification = "Qualification is required.";
    if (!form.workflowStage) newErrors.workflowStage = "Stage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    const selectedAdvisorName = isAdvisor ? currentUser.name : form.assignedTo || "";
    const matchedAdvisor = selectedAdvisorName
      ? activeAdvisors.find((a) => a.name === selectedAdvisorName)
      : null;

    const record = {
      ...form,
      leadType: form.leadType,
      workflowStage: form.workflowStage || firstStageByLeadType[form.leadType],
      source: form.source || "Referral",
      nextFollowUp: isInsuranceCustomer ? (form.followUpDate || form.nextFollowUpDate || "") : "",
      dueDate: form.dueDate || "",
      priority: form.priority || "Medium",
      stageStatus: form.stageStatus || "",
      assignedAdvisorId: isInsuranceCustomer ? (isAdvisor ? currentUser.id : (matchedAdvisor ? String(matchedAdvisor.id) : "")) : "",
      assignedAdvisorName: isInsuranceCustomer ? (isAdvisor ? currentUser.name : selectedAdvisorName) : "",
      assignedTo: isInsuranceCustomer ? selectedAdvisorName : "",
    };

    try {
      await onAdd(record);

      setSuccessMessage("Lead added successfully!");
      setForm(createEmptyForm());
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
          label="Lead Type"
          name="leadType"
          value={form.leadType}
          onChange={handleLeadTypeChange}
        >
          <MenuItem value="Insurance Customer">Insurance Customer</MenuItem>
          <MenuItem value="Advisor">Advisor</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="Workflow Stage"
          name="workflowStage"
          value={form.workflowStage}
          onChange={handleStageChange}
          error={!!errors.workflowStage}
          helperText={errors.workflowStage}
        >
          {visibleStages.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {isInsuranceCustomer && stageStatusOptions[form.workflowStage] && (
          <TextField
            select
            fullWidth
            margin="dense"
            label="Stage Status"
            name="stageStatus"
            value={form.stageStatus}
            onChange={handle}
          >
            {stageStatusOptions[form.workflowStage].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}

        {isInsuranceCustomer && canAssignClient() && (
          <Autocomplete
            size="small"
            fullWidth
            margin="dense"
            options={activeAdvisors}
            getOptionLabel={(option) => {
              const parts = [option.name];
              if (option.advisorCode) parts.push(option.advisorCode);
              return parts.join(" — ");
            }}
            isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[option.advisorCode, option.id ? `ID: ${option.id}` : ""].filter(Boolean).join(" • ")}
                  </Typography>
                </Box>
              </li>
            )}
            value={activeAdvisors.find((a) => a.name === form.assignedTo) || null}
            onChange={(_, newValue) => {
              setForm((prev) => ({ ...prev, assignedTo: newValue ? newValue.name : "" }));
              if (errors.assignedTo) setErrors((prev) => ({ ...prev, assignedTo: "" }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Assigned To" placeholder="Search advisor..." margin="dense" />
            )}
            sx={{ mt: 1 }}
          />
        )}

        <TextField
          select
          fullWidth
          margin="dense"
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handle}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          label="Due Date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handle}
          InputLabelProps={{ shrink: true }}
        />

        <StageForm
          stageConfig={stageConfig}
          stage={form.workflowStage}
          form={form}
          errors={errors}
          onChange={handle}
        />

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
