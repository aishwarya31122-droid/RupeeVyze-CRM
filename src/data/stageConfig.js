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
  "Sourced": [
    select("recruitmentSource", "Recruitment Source", sources)
  ],
  "Documents Submitted": [
    select("documentStatus", "Document Status", ["Pending", "Submitted", "Verified", "Rejected"]),
    dateField("documentSubmissionDate", "Document Submission Date"),
    textarea("remarks", "Remarks"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "documentStatus", value: "Pending" } })
  ],
  "NAAF Generation": [
    select("naafStatus", "NAAF Status", ["Pending", "Generated", "Approved"]),
    dateField("naafGenerationDate", "Generation Date")
  ],
  "25 Hrs Training": [
    select("trainingStatus", "Training Status", ["Pending", "In Progress", "Completed"]),
    dateField("trainingCompletionDate", "Training Completion Date"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "trainingStatus", value: ["Pending", "In Progress"] } })
  ],
  "Exam": [
    select("examStatus", "Exam Status", ["Pending", "Scheduled", "Passed", "Failed"]),
    dateField("examDate", "Exam Date"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "examStatus", value: "Pending" } })
  ],
  "Advisor Code Issued": [
    select("codeStatus", "Code Status", ["Pending", "Generated"]),
    text("advisorCode", "Advisor Code"),
    dateField("codeIssueDate", "Code Issue Date")
  ],
  "Activated": [
    dateField("activationDate", "Activation Date"),
    select("activationStatus", "Activation Status", ["Pending", "Activated"])
  ]
};
