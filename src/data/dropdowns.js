export const pipelineStages = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Qualified",
  "Financial Need Analysis",
  "Need Analysis",
  "Product Recommendation",
  "Illustration Shared",
  "Proposal Shared",
  "Proposal Submitted",
  "Policy Discussion",
  "Medical",
  "Underwriting",
  "Policy Issued",
  "Premium Collected",
  "Active Client",
  "Lost"
];

export const leadTypes = ["Insurance Customer", "Advisor"];

export const leadStatuses = ["Open", "Assigned", "Converted", "Lost"];

export const advisorWorkflowStages = [
  "Interview",
  "Documents",
  "NAAF Generation",
  "Training",
  "Exam",
  "Code Generation",
  "Activation",
  "Dropped"
];

export const customerWorkflowStages = [
  "New Lead",
  "Contacted",
  "Follow-up",
  "Qualified",
  "Financial Need Analysis",
  "Need Analysis",
  "Product Recommendation",
  "Illustration Shared",
  "Proposal Shared",
  "Proposal Submitted",
  "Policy Discussion",
  "Medical",
  "Underwriting",
  "Policy Issued",
  "Premium Collected",
  "Active Client",
  "Lost"
];

export const followUpRequiredStages = new Set([
  "New Lead",
  "Contacted",
  "Follow-up",
  "Qualified",
  "Financial Need Analysis",
  "Need Analysis",
  "Product Recommendation",
  "Illustration Shared",
  "Proposal Shared",
  "Proposal Submitted",
  "Policy Discussion"
]);

export const sources = ["Referral", "LinkedIn", "Walk-in", "Facebook", "Job Portal", "Website"];

export const priorities = ["High", "Medium", "Low"];

export const followUpTypes = ["Phone Call", "WhatsApp", "Email", "Meeting"];

export const recruiterNames = [];

export const adviserStatuses = ["Lead", "Prospect", "Activated", "Dropped"];

export const stageBadge = {
  "New Lead": "#4f46e5",
  "Contacted": "#0ea5e9",
  "Follow-up": "#f59e0b",
  "First Contact": "#0ea5e9",
  "Interested": "#f59e0b",
  "Qualified": "#f97316",
  "Financial Need Analysis": "#10b981",
  "Need Analysis": "#10b981",
  "Product Recommendation": "#8b5cf6",
  "Illustration Shared": "#22c55e",
  "Proposal Shared": "#22c55e",
  "Proposal Submitted": "#0f766e",
  "Policy Discussion": "#0f766e",
  "Medical": "#ec4899",
  "Underwriting": "#7c3aed",
  "Policy Issued": "#0f766e",
  "Premium Collected": "#16a34a",
  "Active Client": "#0f766e",
  "Interview": "#0ea5e9",
  "Documents": "#f97316",
  "New Recruitment Lead": "#6366f1",
  "Interview Scheduled": "#0891b2",
  "Documents Pending": "#f97316",
  "Documents Submitted": "#22c55e",
  "Activated Advisor": "#16a34a",
  "NAAF Generation": "#8b5cf6",
  "Training": "#0284c7",
  "Exam": "#f59e0b",
  "Code Generation": "#22c55e",
  "Activation": "#16a34a",
  "Dropped": "#ef4444",
  "Lost": "#ef4444"
};
