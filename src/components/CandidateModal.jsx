import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import { useCrm } from "../crmContext.jsx";
import { useAuth } from "../authContext.jsx";
import { stageStatusOptions } from "../data/dropdowns.js";
import StageSelect from "./StageSelect.jsx";
import PolicyDetailsForm from "./PolicyDetailsForm.jsx";
import PremiumDetailsForm from "./PremiumDetailsForm.jsx";

export default function CandidateModal({ candidate, onClose, onStageUpdate, onNoteSave, onSave }) {
  const { pipelineStages, sources, followUpRequiredStages, activeAdvisors, advisorStatuses } = useCrm();
  const { canEditClient, canAssignClient, currentUser } = useAuth();
  const isAdvisor = candidate.leadType === "Advisor" || candidate.leadType === "Recruitment";
  const canEdit = canEditClient(candidate);
  const isActiveClient = !isAdvisor && candidate.workflowStage === "Active Client";
  const activatedAdvisorOptions = activeAdvisors || [];
  const initialAssignedTo = candidate.assignedTo || "";
  const initialMatch = activatedAdvisorOptions.some((a) => a.name === initialAssignedTo);
  const [manualAssignedTo, setManualAssignedTo] = useState(initialMatch ? "" : initialAssignedTo);
  const advisorStagesWithStageStatus = new Set(["KYC Complete"]);
  const advisorStagesWithYesNo = new Set([
    "KYC Pending", "KYC Complete",
    "Code Generation", "Activation", "Business Started"
  ]);
  const stageYesNoField = {
    "KYC Pending": "kycReceived",
    "KYC Complete": "kycVerified",
    "Code Generation": "advisorCodeGenerated",
    "Activation": "advisorActivated",
    "Business Started": "businessStarted"
  };
  const stageYesNoLabel = {
    "KYC Pending": "KYC Document Received",
    "KYC Complete": "KYC Verified",
    "Code Generation": "Advisor Code Generated",
    "Activation": "Advisor Activated",
    "Business Started": "Business Started"
  };
  const [validationErrors, setValidationErrors] = useState({});
  const [policyExpanded, setPolicyExpanded] = useState(candidate.policyIssued === "Yes");
  const [premiumExpanded, setPremiumExpanded] = useState(candidate.premiumCollected === "Yes");
  const [form, setForm] = useState({
    name: candidate.name || "",
    mobile: candidate.mobile || candidate.phone || "",
    email: candidate.email || "",
    city: candidate.city || "",
    leadSource: candidate.leadSource || candidate.source || "",
    workflowStage: candidate.workflowStage || pipelineStages[0],
    leadStatus: candidate.leadStatus || "Open",
    assignedTo: initialMatch ? initialAssignedTo : "",
    followUpDate: candidate.nextFollowUp || candidate.followUpDate || "",
    dueDate: candidate.dueDate || "",
    priority: candidate.priority || "Medium",
    stageStatus: candidate.stageStatus || "",
    notes: candidate.notes || "",
    policyIssued: candidate.policyIssued || "No",
    policyNumber: candidate.policyNumber || "",
    policyType: candidate.policyType || "",
    insuranceCompany: candidate.insuranceCompany || "",
    policyStartDate: candidate.policyStartDate || "",
    policyEndDate: candidate.policyEndDate || "",
    sumAssured: candidate.sumAssured || "",
    premiumFrequency: candidate.premiumFrequency || "",
    nomineeName: candidate.nomineeName || "",
    policyRemarks: candidate.policyRemarks || "",
    premiumCollected: candidate.premiumCollected || "No",
    premiumAmount: candidate.premiumAmount || "",
    collectionDate: candidate.collectionDate || "",
    paymentMode: candidate.paymentMode || "",
    transactionReference: candidate.transactionReference || "",
    receiptNumber: candidate.receiptNumber || "",
    collectedBy: candidate.collectedBy || "",
    premiumRemarks: candidate.premiumRemarks || "",
    qualified: candidate.qualified || "",
    interestLevel: candidate.interestLevel || "",
    kycReceived: candidate.kycReceived || "",
    kycVerified: candidate.kycVerified || "",
    kycDocument: candidate.kycDocument || null,
    trainingCompleted: candidate.trainingCompleted || "",
    examPassed: candidate.examPassed || "",
    examCompletionDate: candidate.examCompletionDate || "",
    examScheduledDate: candidate.examScheduledDate || "",
    advisorCodeGenerated: candidate.advisorCodeGenerated || "",
    advisorActivated: candidate.advisorActivated || "",
    businessStarted: candidate.businessStarted || "",
    advisorCode: candidate.advisorCode || "",
    branch: candidate.branch || "",
    reportingManager: candidate.reportingManager || "",
    joiningDate: candidate.joiningDate || "",
    businessLocation: candidate.businessLocation || "",
    bankName: candidate.bankName || "",
    accountNumber: candidate.accountNumber || "",
    ifscCode: candidate.ifscCode || "",
    upiId: candidate.upiId || "",
    remarks: candidate.remarks || "",
    medicalCompletionDate: candidate.medicalCompletionDate || "",
    underwritingCompletionDate: candidate.underwritingCompletionDate || "",
    proposalAttachment: candidate.proposalAttachment || null,
    kycCompletedDate: candidate.kycCompletedDate || ""
  });
  const [selectedStage, setSelectedStage] = useState(candidate.workflowStage || candidate.stage || pipelineStages[0]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "advisorCodeGenerated" && value !== "Yes") next.advisorCode = "";
      if (name === "kycReceived" && value !== "Yes") next.kycDocument = null;
      if (name === "trainingCompleted" && value !== "Yes") next.trainingCompletionDate = "";
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
        next.businessStartDate = "";
        setValidationErrors((prevErrors) => ({ ...prevErrors, businessStartDate: "" }));
      }
      if (name === "stageStatus") {
        if (selectedStage === "Medical" && value !== "Completed") {
          next.medicalCompletionDate = "";
        }
        if (selectedStage === "Underwriting" && value !== "Completed") {
          next.underwritingCompletionDate = "";
        }
        if (selectedStage === "KYC Complete" && value !== "Completed") {
          next.kycCompletedDate = "";
          setValidationErrors((prevErrors) => ({ ...prevErrors, kycCompletedDate: "" }));
        }
        if (selectedStage === "Proposal Submitted" && value !== "Yes") {
          setValidationErrors((prevErrors) => ({ ...prevErrors, proposalAttachment: "" }));
        }
      }
      if (name === "examPassed") {
        if (value !== "Completed") {
          next.examCompletionDate = "";
          setValidationErrors((prevErrors) => ({ ...prevErrors, examCompletionDate: "" }));
        }
        if (value !== "Scheduled") {
          next.examScheduledDate = "";
          setValidationErrors((prevErrors) => ({ ...prevErrors, examScheduledDate: "" }));
        }
      }
      if (name === "examScheduledDate") {
        setValidationErrors((prevErrors) => ({ ...prevErrors, examScheduledDate: "" }));
      }
      if (name === "advisorCodeGenerated") {
        setValidationErrors((prevErrors) => ({ ...prevErrors, advisorCode: "" }));
      }
      if (name === "advisorCode") {
        setValidationErrors((prevErrors) => ({ ...prevErrors, advisorCode: "" }));
      }
      return next;
    });
    if (name === "policyIssued") setPolicyExpanded(value === "Yes");
    if (name === "premiumCollected") setPremiumExpanded(value === "Yes");
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
      setValidationErrors((prev) => ({ ...prev, [fieldName]: "Only PDF, DOC, DOCX, JPG, JPEG, PNG files are supported." }));
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
      setValidationErrors((prev) => ({ ...prev, [fieldName]: "" }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName) => {
    setForm((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleSave = () => {
    const errs = {};
    if (selectedStage === "Proposal Submitted" && form.stageStatus === "Yes") {
      if (!form.proposalAttachment?.fileName) {
        errs.proposalAttachment = "Proposal attachment is required when Proposal Submitted is Yes.";
      }
    }
    if (selectedStage === "Medical" && form.stageStatus === "Completed") {
      if (!form.medicalCompletionDate?.trim()) {
        errs.medicalCompletionDate = "Medical Completion Date is required when Medical is Completed.";
      }
    }
    if (selectedStage === "Exam" && form.examPassed === "Completed") {
      if (!form.examCompletionDate?.trim()) {
        errs.examCompletionDate = "Exam Completion Date is required when Exam Status is Completed.";
      }
    }
    if (selectedStage === "Exam" && form.examPassed === "Scheduled") {
      if (!form.examScheduledDate?.trim()) {
        errs.examScheduledDate = "Exam Scheduled Date is required when Exam Status is Scheduled.";
      }
    }
    if (selectedStage === "Training" && form.trainingCompleted === "Yes") {
      if (!form.trainingCompletionDate?.trim()) {
        errs.trainingCompletionDate = "Training Completion Date is required when Training is Yes.";
      }
    }
    if (selectedStage === "Code Generation" && form.advisorCodeGenerated === "Yes") {
      if (!form.advisorCode?.trim()) {
        errs.advisorCode = "Advisor Code is required when Code Generation is Yes.";
      }
    }
    if (selectedStage === "KYC Complete" && form.stageStatus === "Completed") {
      if (!form.kycCompletedDate?.trim()) {
        errs.kycCompletedDate = "KYC Completed Date is required when Stage Status is Completed.";
      }
    }
    if (selectedStage === "Business Started" && form.businessStarted === "Yes") {
      if (!form.businessStartDate?.trim()) {
        errs.businessStartDate = "Business Started Date is required when Business Started is Yes.";
      }
    }
    if (selectedStage === "Policy Issued" && form.policyIssued === "Yes") {
      if (!form.policyNumber.trim()) errs.policyNumber = "Required";
      if (!form.policyType.trim()) errs.policyType = "Required";
      if (!form.insuranceCompany.trim()) errs.insuranceCompany = "Required";
      if (!form.policyStartDate.trim()) errs.policyStartDate = "Required";
      if (!form.policyEndDate.trim()) errs.policyEndDate = "Required";
      if (!form.premiumFrequency.trim()) errs.premiumFrequency = "Required";
      if (!form.sumAssured.trim()) errs.sumAssured = "Required";
      if (!form.nomineeName.trim()) errs.nomineeName = "Required";
    }
    if (selectedStage === "Premium Collected" && form.premiumCollected === "Yes") {
      if (!form.premiumAmount.trim()) errs.premiumAmount = "Required";
      if (!form.collectionDate.trim()) errs.collectionDate = "Required";
      if (!form.paymentMode.trim()) errs.paymentMode = "Required";
      if (!form.transactionReference.trim()) errs.transactionReference = "Required";
    }
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }
    setValidationErrors({});

    const effectiveAssignedTo = manualAssignedTo.trim() !== "" ? manualAssignedTo : form.assignedTo;
    const isInterestedNo = selectedStage === "Interested" && form.interestLevel === "No";
    const effectiveStage = isInterestedNo ? "Dropped" : selectedStage;
    const stageForFollowUp = selectedStage || form.workflowStage;
    const showFollowUp = followUpRequiredStages.has(stageForFollowUp);
    const selectedAdvisorName = effectiveAssignedTo || candidate.assignedTo || "";
    const matchedAdvisor = selectedAdvisorName
      ? activatedAdvisorOptions.find((a) => a.name === selectedAdvisorName)
      : null;
    const payload = {
      ...form,
      mobile: form.mobile || candidate.mobile || candidate.phone || "",
      phone: form.mobile || candidate.mobile || candidate.phone || "",
      workflowStage: effectiveStage,
      leadSource: form.leadSource || candidate.leadSource || candidate.source || "",
      source: form.leadSource || candidate.leadSource || candidate.source || "",
      leadStatus: isInterestedNo ? "Dropped" : (form.leadStatus || candidate.leadStatus || "Open"),
      assignedTo: selectedAdvisorName,
      assignedAdvisorId: matchedAdvisor ? String(matchedAdvisor.id) : (candidate.assignedAdvisorId || ""),
      assignedAdvisorName: selectedAdvisorName,
      nextFollowUp: showFollowUp ? (form.followUpDate || candidate.nextFollowUp || candidate.followUpDate || "") : "",
      dueDate: form.dueDate || "",
      priority: form.priority || "Medium",
      stageStatus: form.stageStatus || "",
      followUp: {
        ...candidate.followUp,
        type: candidate.followUp?.type || "Phone Call",
        priority: candidate.followUp?.priority || "Medium",
        status: candidate.followUp?.status || "Pending"
      },
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
      proposalAttachment: form.proposalAttachment || null,
      premiumCollected: form.premiumCollected,
      premiumAmount: form.premiumAmount,
      collectionDate: form.collectionDate,
      paymentMode: form.paymentMode,
      transactionReference: form.transactionReference,
      receiptNumber: form.receiptNumber,
      collectedBy: form.collectedBy,
      premiumRemarks: form.premiumRemarks,
      kycCompletedDate: form.kycCompletedDate || ""
    };

    if (onSave) {
      onSave(candidate.id, payload);
    } else {
      onStageUpdate(candidate.id, selectedStage);
      onNoteSave(candidate.id, form.notes);
    }
    setSuccessMessage("Lead updated successfully!");
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 1000);
  };

  const showFollowUp = followUpRequiredStages.has(selectedStage);

  return (
    <Dialog
      open
      fullWidth
      maxWidth={false}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "760px",
          width: "100%",
          borderRadius: 3,
          maxHeight: "85vh",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "#fff",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="caption" color="primary" fontWeight={700} sx={{ letterSpacing: "0.08em", fontSize: "0.7rem", mb: 0.25, display: "block" }}>
              EDIT LEAD
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: "1.5rem", color: "#0f172a", lineHeight: 1.2 }}>
              {candidate.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, color: "text.secondary", mt: 0.5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 3 } }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2.5 }}>{successMessage}</Alert>
        )}

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Lead Source" name="leadSource" value={form.leadSource} onChange={handleChange}>
              {sources.map((source) => (
                <MenuItem key={source} value={source}>{source}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 0.5 }}>
              {isAdvisor ? "Recruitment Stage" : "Workflow Stage"}
            </Typography>
            <StageSelect stage={selectedStage} leadType={candidate.leadType} onChange={(value) => { setSelectedStage(value); setForm((prev) => ({ ...prev, stageStatus: "", medicalCompletionDate: "", underwritingCompletionDate: "" })); }} clientFlow={isActiveClient} />
          </Grid>

          {isAdvisor ? (
            <>
              {selectedStage !== "Exam" && selectedStage !== "Interested" && selectedStage !== "KYC Pending" && selectedStage !== "KYC Complete" && selectedStage !== "Training" && selectedStage !== "Code Generation" && selectedStage !== "Business Started" && (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Status" name="leadStatus" value={form.leadStatus} onChange={handleChange}>
                    {selectedStage === "Business Started" ? (
                      <>
                        <MenuItem value="">Select...</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </>
                    ) : (
                      advisorStatuses.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>
              )}
              {selectedStage !== "Business Started" && (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Priority" name="priority" value={form.priority} onChange={handleChange}>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </TextField>
                </Grid>
              )}
              {advisorStagesWithStageStatus.has(selectedStage) && (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Stage Status" name="stageStatus" value={form.stageStatus} onChange={handleChange}>
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                  </TextField>
                </Grid>
              )}
              {selectedStage === "KYC Complete" && form.stageStatus === "Completed" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="KYC Completed Date"
                    name="kycCompletedDate"
                    type="date"
                    value={form.kycCompletedDate || ""}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(validationErrors.kycCompletedDate)}
                    helperText={validationErrors.kycCompletedDate || ""}
                  />
                </Grid>
              )}
              {selectedStage === "Exam" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Exam Status" name="examPassed" value={form.examPassed || ""} onChange={handleChange}>
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Not Completed">Not Completed</MenuItem>
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                    </TextField>
                  </Grid>
                  {form.examPassed === "Scheduled" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Exam Scheduled Date"
                        name="examScheduledDate"
                        type="date"
                        value={form.examScheduledDate || ""}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(validationErrors.examScheduledDate)}
                        helperText={validationErrors.examScheduledDate || ""}
                      />
                    </Grid>
                  )}
                </>
              )}
              {selectedStage === "Interested" && (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Interested" name="interestLevel" value={form.interestLevel || ""} onChange={handleChange} helperText={form.interestLevel === "No" ? "Selecting No will close the application when saved." : ""}>
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
              )}
              {selectedStage === "Training" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Training" name="trainingCompleted" value={form.trainingCompleted || ""} onChange={handleChange}>
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  {form.trainingCompleted === "Yes" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Training Completion Date"
                        name="trainingCompletionDate"
                        type="date"
                        value={form.trainingCompletionDate || ""}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        error={Boolean(validationErrors.trainingCompletionDate)}
                        helperText={validationErrors.trainingCompletionDate || ""}
                      />
                    </Grid>
                  )}
                </>
              )}
              {selectedStage === "KYC Pending" && (form.kycReceived === "Yes" || form.kycReceived === "No") && (
                <Grid item xs={12}>
                  <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, bgcolor: "#f8fafc" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, fontSize: "0.9rem", color: "#1e293b" }}>
                      KYC Document
                    </Typography>
                    {form.kycReceived === "Yes" && form.kycDocument?.fileName ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.kycDocument.fileName}</Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Button variant="text" size="small" href={form.kycDocument.fileURL} target="_blank" rel="noreferrer" download={form.kycDocument.fileName} sx={{ textTransform: "none" }}>
                            View
                          </Button>
                          <Button component="label" variant="text" size="small" sx={{ textTransform: "none" }}>
                            Replace
                            <input
                              hidden
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, "kycDocument")}
                            />
                          </Button>
                          <Button variant="text" size="small" onClick={() => removeFile("kycDocument")} sx={{ textTransform: "none" }}>
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Button component="label" variant="outlined" sx={{ textTransform: "none", width: "fit-content" }}>
                        Upload KYC Document
                        <input
                          hidden
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "kycDocument")}
                        />
                      </Button>
                    )}
                  </Box>
                </Grid>
              )}
              {advisorStagesWithYesNo.has(selectedStage) && (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label={stageYesNoLabel[selectedStage]} name={stageYesNoField[selectedStage]} value={form[stageYesNoField[selectedStage]] || ""} onChange={handleChange}>
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
              )}
              {selectedStage === "Activation" && form.advisorActivated === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Activation Date"
                    name="activationDate"
                    type="date"
                    value={form.activationDate || ""}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
              {selectedStage === "Code Generation" && form.advisorCodeGenerated === "Yes" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Advisor Code"
                    name="advisorCode"
                    value={form.advisorCode || ""}
                    onChange={handleChange}
                    error={Boolean(validationErrors.advisorCode)}
                    helperText={validationErrors.advisorCode || ""}
                  />
                </Grid>
              )}
              {selectedStage === "Business Started" && form.businessStarted === "Yes" && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>Business Details</Typography>
                    <Divider sx={{ mb: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Business Started Date"
                      name="businessStartDate"
                      type="date"
                      value={form.businessStartDate || ""}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(validationErrors.businessStartDate)}
                      helperText={validationErrors.businessStartDate || ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Advisor Code" name="advisorCode" value={form.advisorCode || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Branch / Office" name="branch" value={form.branch || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Reporting Manager" name="reportingManager" value={form.reportingManager || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Joining Date" type="date" name="joiningDate" value={form.joiningDate || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Business Location" name="businessLocation" value={form.businessLocation || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Bank Name" name="bankName" value={form.bankName || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Account Number" name="accountNumber" value={form.accountNumber || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="IFSC Code" name="ifscCode" value={form.ifscCode || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="UPI ID" name="upiId" value={form.upiId || ""} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Remarks" name="remarks" value={form.remarks || ""} onChange={handleChange} multiline rows={2} />
                  </Grid>
                </>
              )}
            </>
          ) : (
            <>
              {selectedStage === "Qualified" ? (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Qualified" name="qualified" value={form.qualified || ""} onChange={handleChange}>
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
              ) : selectedStage === "Active Client" ? (
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Stage Status" name="stageStatus" value={form.stageStatus} onChange={handleChange}>
                    <MenuItem value="">Select...</MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
              ) : stageStatusOptions[selectedStage] ? (
                <>
                  {!["Proposal Submitted", "Medical", "Underwriting"].includes(selectedStage) && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
                        {selectedStage} Details
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Stage Status" name="stageStatus" value={form.stageStatus} onChange={handleChange}>
                      <MenuItem value="">Select...</MenuItem>
                      {stageStatusOptions[selectedStage].map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                      {selectedStage === "Proposal Submitted" && form.stageStatus === "Yes" && (
                        <>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
                              Proposal Document
                            </Typography>
                            <Divider sx={{ mb: 1 }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ border: validationErrors.proposalAttachment ? "1px solid #d32f2f" : "1px solid", borderColor: validationErrors.proposalAttachment ? "#d32f2f" : "divider", borderRadius: 2, p: 2, bgcolor: "#f8fafc" }}>
                              {!form.proposalAttachment?.fileName ? (
                                <Button component="label" variant="outlined" sx={{ textTransform: "none", width: "fit-content" }}>
                                  📎 Attach Proposal
                                  <input
                                    hidden
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, "proposalAttachment")}
                                  />
                                </Button>
                              ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.proposalAttachment.fileName}</Typography>
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                      <Button
                                        variant="text"
                                        size="small"
                                        href={form.proposalAttachment.fileURL}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={form.proposalAttachment.fileName}
                                        sx={{ textTransform: "none" }}
                                      >
                                        View
                                      </Button>
                                      <Button component="label" variant="text" size="small" sx={{ textTransform: "none" }}>
                                        Replace
                                        <input
                                          hidden
                                          type="file"
                                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                          onChange={(e) => handleFileUpload(e, "proposalAttachment")}
                                        />
                                      </Button>
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => removeFile("proposalAttachment")}
                                        sx={{ textTransform: "none" }}
                                      >
                                        Remove
                                      </Button>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                              {!form.proposalAttachment?.fileName && (
                                <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                                  Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                                </Typography>
                              )}
                              {validationErrors.proposalAttachment && (
                                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                  {validationErrors.proposalAttachment}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </>
                      )}
                  {selectedStage === "Medical" && form.stageStatus === "Completed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Medical Completion Date"
                        name="medicalCompletionDate"
                        type="date"
                        value={form.medicalCompletionDate || ""}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  )}
                  {selectedStage === "Exam" && form.examPassed === "Completed" && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Exam Completion Date"
                        name="examCompletionDate"
                        type="date"
                        value={form.examCompletionDate || ""}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  )}
                  {selectedStage === "Underwriting" && form.stageStatus === "Completed" && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Underwriting Completion Date"
                          name="underwritingCompletionDate"
                          type="date"
                          value={form.underwritingCompletionDate || ""}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </>
                  )}
                </>
              ) : null}
            </>
          )}

          {canAssignClient() && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 0.5 }}>Assigned To</Typography>
              <TextField select fullWidth label="Select Active Advisor" name="assignedTo" value={form.assignedTo} onChange={handleChange} sx={{ mb: 1 }}>
                <MenuItem value="">None</MenuItem>
                {activatedAdvisorOptions.map((advisor) => (
                  <MenuItem key={advisor.id} value={advisor.name}>
                    {advisor.name}{advisor.advisorCode ? ` (${advisor.advisorCode})` : ""}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Enter Advisor Name Manually" placeholder="Enter advisor name manually" value={manualAssignedTo} onChange={(e) => setManualAssignedTo(e.target.value)} />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Due Date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          {!isAdvisor && showFollowUp && (
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Follow-up Date" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
          )}
        </Grid>

        {!isAdvisor && selectedStage === "Policy Issued" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
              Policy Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <PolicyDetailsForm
              form={form}
              handleChange={handleChange}
              validationErrors={validationErrors}
              policyExpanded={policyExpanded}
              setPolicyExpanded={setPolicyExpanded}
            />
          </Box>
        )}
        {!isAdvisor && selectedStage === "Premium Collected" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.9rem", color: "#1e293b" }}>
              Premium Collection Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <PremiumDetailsForm
              form={form}
              handleChange={handleChange}
              validationErrors={validationErrors}
              premiumExpanded={premiumExpanded}
              setPremiumExpanded={setPremiumExpanded}
            />
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <TextField fullWidth label="Notes" name="notes" value={form.notes} onChange={handleChange} multiline rows={3} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ position: "sticky", bottom: 0, bgcolor: "#fff", borderTop: "1px solid", borderColor: "divider", px: 3, py: 2, justifyContent: "flex-end", gap: 1.5 }}>
        <Button onClick={onClose} disabled={!!successMessage} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!!successMessage} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3, boxShadow: 2 }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
