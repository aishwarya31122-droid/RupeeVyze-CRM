export const insuranceCustomerStages = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Need Analysis",
  "Proposal Shared",
  "Policy Discussion",
  "Policy Issued",
  "Lost"
];

export const advisorRecruitmentStages = [
  "New Recruitment Lead",
  "Contacted",
  "Interview",
  "Documents",
  "NAAF Generation",
  "Training",
  "Exam",
  "Code Generation",
  "Activated Advisor",
  "Dropped"
];

const text = (name, label, opts) => ({ type: "text", name, label, ...opts });
const select = (name, label, options, opts) => ({ type: "select", name, label, options, ...opts });
const dateField = (name, label, opts) => ({ type: "date", name, label, ...opts });
const textarea = (name, label, opts) => ({ type: "textarea", name, label, ...opts });

export const insuranceCustomerStageFields = {
  "New Lead": [
    select("leadSource", "Lead Source", ["Referral", "LinkedIn", "Walk-in", "Facebook", "Job Portal", "Website"]),
    text("assignedTo", "Assigned To")
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
  "New Recruitment Lead": [
    select("recruitmentSource", "Recruitment Source", ["Referral", "LinkedIn", "Walk-in", "Facebook", "Job Portal", "Website"])
  ],
  "Contacted": [
    select("contactStatus", "Contact Status", ["Connected", "Not Connected", "Busy", "No Response"]),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Interview": [
    select("interviewStatus", "Interview Status", ["Pending", "Scheduled", "Completed", "Rejected"]),
    dateField("interviewDate", "Interview Date"),
    dateField("followUpDate", "Follow-up Date")
  ],
  "Documents": [
    select("documentStatus", "Document Status", ["Pending", "Submitted", "Verified", "Rejected"]),
    dateField("documentSubmissionDate", "Document Submission Date"),
    textarea("remarks", "Remarks"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "documentStatus", value: "Pending" } })
  ],
  "NAAF Generation": [
    select("naafStatus", "NAAF Status", ["Pending", "Generated", "Approved"]),
    dateField("naafGenerationDate", "Generation Date")
  ],
  "Training": [
    select("trainingStatus", "Training Status", ["Pending", "In Progress", "Completed"]),
    dateField("trainingCompletionDate", "Training Completion Date"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "trainingStatus", value: ["Pending", "In Progress"] } })
  ],
  "Exam": [
    select("examStatus", "Exam Status", ["Pending", "Scheduled", "Passed", "Failed"]),
    dateField("examDate", "Exam Date"),
    dateField("followUpDate", "Follow-up Date", { dependsOn: { field: "examStatus", value: "Pending" } })
  ],
  "Code Generation": [
    select("codeStatus", "Code Status", ["Pending", "Generated"]),
    text("advisorCode", "Advisor Code"),
    dateField("codeIssueDate", "Code Issue Date")
  ],
  "Activated Advisor": [
    dateField("activationDate", "Activation Date"),
    select("activationStatus", "Activation Status", ["Pending", "Activated"])
  ],
  "Dropped": [
    textarea("dropReason", "Drop Reason"),
    dateField("dropDate", "Drop Date")
  ]
};
