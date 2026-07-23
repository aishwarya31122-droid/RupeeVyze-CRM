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
import { useAuth } from "../authContext.jsx";
import StageForm, { getStageDefaultValues, clearHiddenStageFields } from "./StageForm.jsx";
import {
  insuranceCustomerStages,
  advisorRecruitmentStages,
  insuranceCustomerStageFields,
  advisorStageFields,
} from "../data/stageConfig.js";

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
  "nextFollowUp",
]);

export default function CandidateForm({ open, onClose, onAdd, pipelineStages: propPipelineStages, sources: propSources }) {
  const { candidates } = useCrm();
  const { currentUser, isAdvisor } = useAuth();
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
      ? candidates.find((c) => (c.leadType === "Advisor" || c.leadType === "Recruitment") && c.name === selectedAdvisorName)
      : null;

    const record = {
      ...form,
      leadType: form.leadType,
      workflowStage: form.workflowStage || firstStageByLeadType[form.leadType],
      source: form.source || "Referral",
      nextFollowUp: isInsuranceCustomer ? (form.followUpDate || form.nextFollowUpDate || "") : "",
      assignedAdvisorId: isInsuranceCustomer ? (isAdvisor ? currentUser.id : matchedAdvisor?.id || "") : "",
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
