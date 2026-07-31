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
  "Policy Discussion": [
    select("discussionStatus", "Discussion Status", ["Pending", "Completed"]),
    dateField("followUpDate", "Follow-up Date")
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
    select("interestLevel", "Interest Level", ["High", "Medium", "Low"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "KYC Pending": [
    select("stageStatus", "Stage Status", ["Open", "In Progress", "Completed", "On Hold"]),
    select("kycReceived", "KYC Documents Received", ["Yes", "No"])
  ],
  "KYC Complete": [
    select("stageStatus", "Stage Status", ["Open", "In Progress", "Completed", "On Hold"]),
    select("kycVerified", "KYC Verified", ["Yes", "No"])
  ],
  "Training": [
    dateField("trainingCompletionDate", "Training Completion Date"),
    select("stageStatus", "Stage Status", ["Open", "In Progress", "Completed", "On Hold"])
  ],
  "Exam": [
    dateField("examDate", "Exam Date"),
    select("examPassed", "Exam Passed", ["Yes", "No"])
  ],
  "Code Generation": [
    { type: "text", name: "advisorCode", label: "Advisor Code", dependsOn: { field: "advisorCodeGenerated", value: "Yes" } },
    { type: "date", name: "codeGenerationDate", label: "Code Generation Date" },
    select("advisorCodeGenerated", "Advisor Code Generated", ["Yes", "No"])
  ],
  "Activation": [
    dateField("activationDate", "Activation Date"),
    select("advisorActivated", "Advisor Activated", ["Yes", "No"])
  ],
  "Business Started": [
    dateField("businessStartDate", "Business Start Date"),
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
