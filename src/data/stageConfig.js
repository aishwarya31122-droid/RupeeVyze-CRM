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
  "Policy Issued": [
    text("policyNumber", "Policy Number"),
    dateField("policyIssueDate", "Policy Issue Date"),
    text("premiumAmount", "Premium Amount")
  ],
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
  "KYC": [
    select("kycStatus", "KYC Status", ["Pending", "Submitted", "Verified", "Rejected", "Completed"])
  ],
  "Training": [
    select("trainingStatus", "Training Status", ["Pending", "In Progress", "Completed"]),
    dateField("trainingCompletionDate", "Training Completion Date")
  ],
  "Exam": [
    select("examStatus", "Exam Status", ["Not Scheduled", "Scheduled", "Completed", "Passed", "Failed"]),
    { type: "date", name: "examDate", label: "Exam Date", dependsOn: { field: "examStatus", value: "Scheduled" } }
  ],
  "Code Generation": [
    select("codeStatus", "Code Status", ["Pending", "Generated"]),
    { type: "text", name: "advisorCode", label: "Advisor Code", dependsOn: { field: "codeStatus", value: "Generated" } },
    { type: "date", name: "codeGenerationDate", label: "Code Generation Date", dependsOn: { field: "codeStatus", value: "Generated" } }
  ],
  "Activation": [
    select("activationStatus", "Activation Status", ["Pending", "Activated"]),
    { type: "date", name: "activationDate", label: "Activation Date", dependsOn: { field: "activationStatus", value: "Activated" } }
  ],
  "Business Started": [
    dateField("businessStartDate", "Business Start Date"),
    select("businessStatus", "Business Status", ["Pending", "Active", "Inactive"])
  ]
};
