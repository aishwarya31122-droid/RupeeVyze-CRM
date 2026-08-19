import { customerWorkflowStages, advisorWorkflowStages, sources } from "./dropdowns.js";

export const insuranceCustomerStages = customerWorkflowStages;
export const advisorRecruitmentStages = advisorWorkflowStages;

const text = (name, label, opts) => ({ type: "text", name, label, ...opts });
const select = (name, label, options, opts) => ({ type: "select", name, label, options, ...opts });
const dateField = (name, label, opts) => ({ type: "date", name, label, ...opts });
const textarea = (name, label, opts) => ({ type: "textarea", name, label, ...opts });

export const insuranceCustomerStageFields = {
  "New Lead": [
    select("leadSource", "Lead Source", sources)
  ],
  "Qualified": [
    select("qualified", "Qualified", ["Yes", "No"])
  ],
  "Contacted": [
    select("contactStatus", "Contact Status", ["Connected", "Not Connected", "Wrong Number", "Switched Off", "Busy"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Follow-up": [
    select("followUpStatus", "Follow-up Status", ["Pending", "Completed", "Rescheduled", "No Response"]),
    dateField("nextFollowUpDate", "Next Follow-up Date")
  ],
  "Need Analysis": [
    select("needAnalysisStatus", "Need Analysis Status", ["Pending", "Completed"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Proposal Shared": [
    select("proposalStatus", "Proposal Status", ["Pending", "Shared", "Reviewed"]),
    dateField("proposalSharedDate", "Proposal Shared Date"),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Proposal Submitted": [
    { type: "file", name: "proposalAttachment", label: "Proposal Attachment", accept: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"] }
  ],
  "Policy Discussion": [
    select("discussionStatus", "Discussion Status", ["Pending", "Completed"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Medical": [
    dateField("medicalCompletionDate", "Medical Completion Date", { dependsOn: { field: "stageStatus", value: "Completed" } })
  ],
  "Underwriting": [
    dateField("underwritingCompletionDate", "Underwriting Completion Date", { dependsOn: { field: "stageStatus", value: "Completed" } })
  ],
  "Policy Issued": [],
  "Lost": [
    textarea("lostReason", "Lost Reason")
  ]
};

export const advisorStageFields = {
  "New Lead": [
    select("recruitmentSource", "Recruitment Source", sources)
  ],
  "First Contact": [
    select("contactStatus", "Contact Status", ["Connected", "Not Connected", "Wrong Number", "Switched Off"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Interested": [
    select("interestLevel", "Interested", ["Yes", "No"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "KYC Pending": [
    select("kycReceived", "KYC Document Received", ["Yes", "No"]),
    { type: "file", name: "kycDocument", label: "KYC Document", accept: [".pdf", ".jpg", ".jpeg", ".png"], dependsOn: { field: "kycReceived", value: "No" } }
  ],
  "KYC Complete": [
    select("stageStatus", "Stage Status", ["Open", "In Progress", "Completed", "On Hold"]),
    dateField("kycCompletedDate", "KYC Completed Date", { dependsOn: { field: "stageStatus", value: "Completed" } }),
    select("kycVerified", "KYC Verified", ["Yes", "No"])
  ],
  "Training": [
    select("trainingCompleted", "Training", ["Yes", "No"]),
    dateField("trainingCompletionDate", "Training Completion Date", { dependsOn: { field: "trainingCompleted", value: "Yes" } })
  ],
  "Exam": [
    dateField("examCompletionDate", "Exam Completion Date", { dependsOn: { field: "examPassed", value: "Completed" } }),
    dateField("examScheduledDate", "Exam Scheduled Date", { dependsOn: { field: "examPassed", value: "Scheduled" } }),
    select("examPassed", "Exam Status", ["Completed", "Not Completed", "Scheduled"])
  ],
  "Code Generation": [
    { type: "text", name: "advisorCode", label: "Advisor Code", dependsOn: { field: "advisorCodeGenerated", value: "Yes" } },
    { type: "date", name: "codeGenerationDate", label: "Code Generation Date" },
    select("advisorCodeGenerated", "Advisor Code Generated", ["Yes", "No"])
  ],
  "Activation": [
    dateField("activationDate", "Activation Date", { dependsOn: { field: "advisorActivated", value: "Yes" } }),
    select("advisorActivated", "Advisor Activated", ["Yes", "No"])
  ],
  "Business Started": [
    dateField("businessStartDate", "Business Started Date", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    select("businessStarted", "Business Started", ["Yes", "No"]),
    { type: "section", name: "businessDetailsSection", label: "Business Details", dependsOn: { field: "businessStarted", value: "Yes" } },
    text("advisorCode", "Advisor Code", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("branch", "Branch / Office", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("reportingManager", "Reporting Manager", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    dateField("joiningDate", "Joining Date", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("businessLocation", "Business Location", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("bankName", "Bank Name", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("accountNumber", "Account Number", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("ifscCode", "IFSC Code", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    text("upiId", "UPI ID", { dependsOn: { field: "businessStarted", value: "Yes" } }),
    textarea("remarks", "Remarks", { dependsOn: { field: "businessStarted", value: "Yes" } })
  ]
};
