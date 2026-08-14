import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { useCrm } from "../crmContext.jsx";
import { useAuth } from "../authContext.jsx";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { getStageDefaultValues, clearHiddenStageFields, getStageFields } from "./StageForm.jsx";
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
  policyIssued: "No",
  policyNumber: "",
  policyType: "",
  insuranceCompany: "",
  policyStartDate: "",
  policyEndDate: "",
  sumAssured: "",
  premiumFrequency: "",
  nomineeName: "",
  policyRemarks: "",
  premiumCollected: "No",
  premiumAmount: "",
  collectionDate: "",
  paymentMode: "",
  transactionReference: "",
  receiptNumber: "",
  collectedBy: "",
  premiumRemarks: "",
  medicalCompletionDate: "",
  underwritingCompletionDate: "",
  proposalAttachment: null,
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
  "policyIssued", "policyNumber", "policyType", "insuranceCompany",
  "policyStartDate", "policyEndDate", "sumAssured", "premiumFrequency",
  "nomineeName", "policyRemarks", "premiumCollected", "premiumAmount",
  "collectionDate", "paymentMode", "transactionReference", "receiptNumber",
  "collectedBy", "premiumRemarks", "proposalAttachment",
]);

function shouldShowField(field, formValues) {
  if (!field.dependsOn) return true;
  const val = formValues[field.dependsOn.field];
  const expected = field.dependsOn.value;
  if (Array.isArray(expected)) {
    return expected.includes(val);
  }
  return val === expected;
}

const inputHeight = { "& .MuiOutlinedInput-root": { height: 54, borderRadius: "8px" } };
const inputLabelHeight = {
  "& .MuiInputLabel-root": { lineHeight: "0.8em" },
  "& .MuiInputLabel-shrink": { lineHeight: "1.4375em" },
};

export default function CandidateForm({ open, onClose, onAdd }) {
  const { activeAdvisors } = useCrm();
  const { currentUser, isAdvisor, canAssignClient } = useAuth();
  const [form, setForm] = useState(() => createEmptyForm());
  const [errors, setErrors] = useState({});
  const [manualAssignedTo, setManualAssignedTo] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(createEmptyForm());
      setErrors({});
      setManualAssignedTo("");
      setSuccessMessage("");
    }
  }, [open]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "advisorCodeGenerated" && value !== "Yes") next.advisorCode = "";
      if (name === "businessStarted" && value !== "Yes") {
        next.advisorCode = "";
        next.branch = "";
        next.reportingManager = "";
        next.joiningDate = "";
        next.businessLocation = "";
        next.bankName = "";
        next.accountNumber = "";
        next.ifscCode = "";
        next.upiId = "";
        next.remarks = "";
      }
      if (name === "stageStatus") {
        if (prev.workflowStage === "Medical" && value !== "Completed") {
          next.medicalCompletionDate = "";
        }
        if (prev.workflowStage === "Underwriting" && value !== "Completed") {
          next.underwritingCompletionDate = "";
        }
      }
      if (name === "examPassed") {
        if (value !== "Completed") next.examCompletionDate = "";
        if (value !== "Scheduled") next.examScheduledDate = "";
      }
      if (name === "trainingCompleted" && value !== "Yes") next.trainingCompletionDate = "";
      if (name === "stageStatus" && prev.workflowStage === "Proposal Submitted" && value !== "Yes") {
        setErrors((prevErrors) => ({ ...prevErrors, proposalAttachment: "" }));
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [fieldName]: "Only PDF, DOC, DOCX, JPG, JPEG, PNG files are supported." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        [fieldName]: {
          fileName: file.name,
          fileType: file.type,
          fileURL: reader.result,
          uploadedAt: new Date().toISOString()
        }
      }));
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName) => {
    setForm((prev) => ({ ...prev, [fieldName]: null }));
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

  const stageFields = getStageFields(stageConfig, form.workflowStage);

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

    if (form.workflowStage === "Proposal Submitted" && form.stageStatus === "Yes") {
      if (!form.proposalAttachment?.fileName) newErrors.proposalAttachment = "Proposal attachment is required when Proposal Submitted is Yes.";
    }
    if (form.workflowStage === "Medical" && form.stageStatus === "Completed") {
      if (!form.medicalCompletionDate?.trim()) newErrors.medicalCompletionDate = "Medical Completion Date is required when Medical is Completed.";
    }
    if (form.workflowStage === "Exam" && form.examPassed === "Completed") {
      if (!form.examCompletionDate?.trim()) newErrors.examCompletionDate = "Exam Completion Date is required when Exam Status is Completed.";
    }
    if (form.workflowStage === "Exam" && form.examPassed === "Scheduled") {
      if (!form.examScheduledDate?.trim()) newErrors.examScheduledDate = "Exam Scheduled Date is required when Exam Status is Scheduled.";
    }
    if (form.workflowStage === "Training" && form.trainingCompleted === "Yes") {
      if (!form.trainingCompletionDate?.trim()) newErrors.trainingCompletionDate = "Training Completion Date is required when Training is Yes.";
    }
    if (form.workflowStage === "Code Generation" && form.advisorCodeGenerated === "Yes") {
      if (!form.advisorCode?.trim()) newErrors.advisorCode = "Advisor Code is required when Code Generation is Yes.";
    }
    if (form.workflowStage === "Policy Issued" && form.policyIssued === "Yes") {
      if (!form.policyNumber.trim()) newErrors.policyNumber = "Required";
      if (!form.policyType.trim()) newErrors.policyType = "Required";
      if (!form.insuranceCompany.trim()) newErrors.insuranceCompany = "Required";
      if (!form.policyStartDate.trim()) newErrors.policyStartDate = "Required";
      if (!form.policyEndDate.trim()) newErrors.policyEndDate = "Required";
      if (!form.premiumFrequency.trim()) newErrors.premiumFrequency = "Required";
      if (!form.sumAssured.trim()) newErrors.sumAssured = "Required";
      if (!form.nomineeName.trim()) newErrors.nomineeName = "Required";
    }
    if (form.workflowStage === "Premium Collected" && form.premiumCollected === "Yes") {
      if (!form.premiumAmount.trim()) newErrors.premiumAmount = "Required";
      if (!form.collectionDate.trim()) newErrors.collectionDate = "Required";
      if (!form.paymentMode.trim()) newErrors.paymentMode = "Required";
      if (!form.transactionReference.trim()) newErrors.transactionReference = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    const effectiveAssignedTo = manualAssignedTo.trim() !== "" ? manualAssignedTo : form.assignedTo;
    const selectedAdvisorName = isAdvisor ? currentUser.name : effectiveAssignedTo || "";
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
      policyIssued: form.policyIssued,
      policyNumber: form.policyNumber,
      policyType: form.policyType,
      insuranceCompany: form.insuranceCompany,
      policyStartDate: form.policyStartDate,
      policyEndDate: form.policyEndDate,
      premiumFrequency: form.premiumFrequency,
      sumAssured: form.sumAssured,
      nomineeName: form.nomineeName,
      policyRemarks: form.policyRemarks,
      medicalCompletionDate: form.medicalCompletionDate || "",
      underwritingCompletionDate: form.underwritingCompletionDate || "",
      proposalAttachment: form.proposalAttachment || null,
      premiumCollected: form.premiumCollected,
      premiumAmount: form.premiumAmount,
      collectionDate: form.collectionDate,
      paymentMode: form.paymentMode,
      transactionReference: form.transactionReference,
      receiptNumber: form.receiptNumber,
      collectedBy: form.collectedBy,
      premiumRemarks: form.premiumRemarks,
    };

    if (record.workflowStage === "Interested" && record.interestLevel === "No") {
      record.workflowStage = "Dropped";
      record.leadStatus = "Dropped";
    }

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

  const stageFieldComponent = (field) => {
    if (!shouldShowField(field, form)) return null;

    if (field.type === "section") {
      return (
        <div style={{ width: "100%" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
            {field.label}
          </Typography>
          <Divider sx={{ mb: 1 }} />
        </div>
      );
    }

    const commonProps = {
      fullWidth: true,
      name: field.name,
      value: form[field.name] || "",
      onChange: handle,
      error: !!errors[field.name],
      helperText: errors[field.name] || "",
      sx: { ...inputHeight, ...inputLabelHeight },
    };

    if (field.type === "select") {
      return (
        <TextField select {...commonProps} label={field.label}>
          {field.options.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.type === "date") {
      return (
        <TextField {...commonProps} label={field.label} type="date" InputLabelProps={{ shrink: true }} />
      );
    }

    if (field.type === "file") {
      const file = form[field.name];
      if (field.name === "proposalAttachment" && form.stageStatus !== "Yes") {
        return null;
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {field.name === "proposalAttachment" && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
                Proposal Document
              </Typography>
              <Divider sx={{ mb: 1 }} />
            </>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              border: field.name === "proposalAttachment" ? `1px solid ${errors[field.name] ? "#d32f2f" : "rgba(148,163,184,0.35)"}` : undefined,
              borderRadius: field.name === "proposalAttachment" ? 12 : undefined,
              padding: field.name === "proposalAttachment" ? 14 : undefined,
              background: field.name === "proposalAttachment" ? "#f8fafc" : undefined,
            }}
          >
            {!file?.fileName ? (
              <Button component="label" variant="outlined" sx={{ textTransform: "none", width: "fit-content" }}>
                📎 Attach Proposal
                <input
                  hidden
                  type="file"
                  accept={field.accept?.join(",")}
                  onChange={(e) => handleFileUpload(e, field.name)}
                />
              </Button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{file.fileName}</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      variant="text"
                      size="small"
                      href={file.fileURL}
                      target="_blank"
                      rel="noreferrer"
                      download={file.fileName}
                      sx={{ textTransform: "none" }}
                    >
                      View
                    </Button>
                    <Button component="label" variant="text" size="small" sx={{ textTransform: "none" }}>
                      Replace
                      <input
                        hidden
                        type="file"
                        accept={field.accept?.join(",")}
                        onChange={(e) => handleFileUpload(e, field.name)}
                      />
                    </Button>
                    <Button variant="text" size="small" onClick={() => removeFile(field.name)} sx={{ textTransform: "none" }}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!file?.fileName && (
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG</span>
            )}
            {errors[field.name] && <div style={{ color: "#d32f2f", fontSize: "0.75rem" }}>{errors[field.name]}</div>}
          </div>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <TextField {...commonProps} label={field.label} multiline rows={field.rows || 2} />
      );
    }

    return <TextField {...commonProps} label={field.label} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "760px",
          width: "100%",
          borderRadius: 2.5,
          maxHeight: "85vh",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pt: 3,
          pb: 1,
          px: 3,
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "#fff",
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.2,
        }}
      >
        Add Lead
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 1,
          pb: 0,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 3 },
        }}
      >
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handle}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              value={form.mobile}
              onChange={handle}
              error={!!errors.mobile}
              helperText={errors.mobile}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handle}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={form.city}
              onChange={handle}
              error={!!errors.city}
              helperText={errors.city}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handle}
              error={!!errors.qualification}
              helperText={errors.qualification}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Lead Type"
              name="leadType"
              value={form.leadType}
              onChange={handleLeadTypeChange}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            >
              <MenuItem value="Insurance Customer">Insurance Customer</MenuItem>
              <MenuItem value="Advisor">Advisor</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Workflow Stage"
              name="workflowStage"
              value={form.workflowStage}
              onChange={handleStageChange}
              error={!!errors.workflowStage}
              helperText={errors.workflowStage}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            >
              {visibleStages.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid>
          {isInsuranceCustomer && stageStatusOptions[form.workflowStage] && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Stage Status"
                name="stageStatus"
                value={form.stageStatus}
                onChange={handle}
                sx={{ ...inputHeight, ...inputLabelHeight }}
              >
                <MenuItem value="">Select...</MenuItem>
                {stageStatusOptions[form.workflowStage].map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          {isInsuranceCustomer && [
            "Proposal Submitted",
            "Medical",
            "Underwriting",
            "Policy Issued",
            "Premium Collected"
          ].includes(form.workflowStage) && (
            <>
              {(form.workflowStage === "Policy Issued" || form.workflowStage === "Premium Collected") && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
                    {form.workflowStage === "Policy Issued" ? "Policy Details" : "Premium Collection Details"}
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
              )}
            </>
          )}
          {stageFields.map((field) => {
            if (!shouldShowField(field, form)) return null;
            return (
              <Grid item xs={12} sm={field.type === "section" ? 12 : 6} key={field.name}>
                {stageFieldComponent(field)}
              </Grid>
            );
          })}
          {isInsuranceCustomer && canAssignClient() && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Select Active Advisor"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handle}
                sx={{ mb: 1.5, ...inputHeight, ...inputLabelHeight }}
              >
                <MenuItem value="">None</MenuItem>
                {activeAdvisors.map((advisor) => (
                  <MenuItem key={advisor.id} value={advisor.name}>
                    {advisor.name}{advisor.advisorCode ? ` (${advisor.advisorCode})` : ""}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Enter Advisor Name Manually"
                placeholder="Enter advisor name manually"
                value={manualAssignedTo}
                onChange={(e) => setManualAssignedTo(e.target.value)}
                sx={{ ...inputHeight, ...inputLabelHeight }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={handle}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handle}
              InputLabelProps={{ shrink: true }}
              sx={{ ...inputHeight, ...inputLabelHeight }}
            />
          </Grid>
          {isInsuranceCustomer && form.workflowStage === "Policy Issued" && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Policy Issued"
                name="policyIssued"
                value={form.policyIssued}
                onChange={handle}
                sx={{ ...inputHeight, ...inputLabelHeight }}
              >
                <MenuItem value="No">No</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
              </TextField>
            </Grid>
          )}
          {isInsuranceCustomer && form.workflowStage === "Policy Issued" && (
            <Grid item xs={12}>
              <Collapse in={form.policyIssued === "Yes"}>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Policy Number *"
                      name="policyNumber"
                      value={form.policyNumber}
                      onChange={handle}
                      error={!!errors.policyNumber}
                      helperText={errors.policyNumber}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Insurance Company *"
                      name="insuranceCompany"
                      value={form.insuranceCompany}
                      onChange={handle}
                      error={!!errors.insuranceCompany}
                      helperText={errors.insuranceCompany}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Policy Type *"
                      name="policyType"
                      value={form.policyType}
                      onChange={handle}
                      error={!!errors.policyType}
                      helperText={errors.policyType}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Premium Frequency *"
                      name="premiumFrequency"
                      value={form.premiumFrequency}
                      onChange={handle}
                      error={!!errors.premiumFrequency}
                      helperText={errors.premiumFrequency}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
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
                      onChange={handle}
                      error={!!errors.policyStartDate}
                      helperText={errors.policyStartDate}
                      InputLabelProps={{ shrink: true }}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Policy End Date *"
                      type="date"
                      name="policyEndDate"
                      value={form.policyEndDate}
                      onChange={handle}
                      error={!!errors.policyEndDate}
                      helperText={errors.policyEndDate}
                      InputLabelProps={{ shrink: true }}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Sum Assured *"
                      name="sumAssured"
                      value={form.sumAssured}
                      onChange={handle}
                      error={!!errors.sumAssured}
                      helperText={errors.sumAssured}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nominee Name *"
                      name="nomineeName"
                      value={form.nomineeName}
                      onChange={handle}
                      error={!!errors.nomineeName}
                      helperText={errors.nomineeName}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="policyRemarks"
                      value={form.policyRemarks}
                      onChange={handle}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          )}
          {isInsuranceCustomer && form.workflowStage === "Premium Collected" && (
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Premium Collected"
                name="premiumCollected"
                value={form.premiumCollected}
                onChange={handle}
                sx={{ ...inputHeight, ...inputLabelHeight }}
              >
                <MenuItem value="No">No</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
              </TextField>
            </Grid>
          )}
          {isInsuranceCustomer && form.workflowStage === "Premium Collected" && (
            <Grid item xs={12}>
              <Collapse in={form.premiumCollected === "Yes"}>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Premium Amount *"
                      name="premiumAmount"
                      value={form.premiumAmount}
                      onChange={handle}
                      error={!!errors.premiumAmount}
                      helperText={errors.premiumAmount}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Collection Date *"
                      type="date"
                      name="collectionDate"
                      value={form.collectionDate}
                      onChange={handle}
                      error={!!errors.collectionDate}
                      helperText={errors.collectionDate}
                      InputLabelProps={{ shrink: true }}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Mode *"
                      name="paymentMode"
                      value={form.paymentMode}
                      onChange={handle}
                      error={!!errors.paymentMode}
                      helperText={errors.paymentMode}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
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
                      onChange={handle}
                      error={!!errors.transactionReference}
                      helperText={errors.transactionReference}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Receipt Number"
                      name="receiptNumber"
                      value={form.receiptNumber}
                      onChange={handle}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Collected By"
                      name="collectedBy"
                      value={form.collectedBy}
                      onChange={handle}
                      sx={{ ...inputHeight, ...inputLabelHeight }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="premiumRemarks"
                      value={form.premiumRemarks}
                      onChange={handle}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handle}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "#fff",
          px: 3,
          py: 2.5,
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={!!successMessage}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, height: 44 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!!successMessage}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, height: 44, boxShadow: 2 }}
        >
          Save Lead
        </Button>
      </DialogActions>
    </Dialog>
  );
}
