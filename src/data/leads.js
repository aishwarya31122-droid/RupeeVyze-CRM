import { advisorWorkflowStages, customerWorkflowStages, leadStatuses, recruiterNames, sources } from "./dropdowns.js";

function createFutureDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export function normalizeLead(lead, index = 0) {
  const leadType = lead.leadType || "Insurance Customer";
  const workflowStage = lead.workflowStage || (leadType === "Advisor Recruitment" ? advisorWorkflowStages[0] : customerWorkflowStages[0]);
  const createdDate = lead.createdDate || createFutureDate(-(index + 2));
  const nextFollowUp = lead.nextFollowUp || createFutureDate(5 + index);
  const assignedTo = lead.assignedTo || recruiterNames[index % recruiterNames.length];
  const leadSource = lead.leadSource || lead.source || sources[index % sources.length];
  const priority = lead.priority || lead.followUp?.priority || ["High", "Medium", "Low"][index % 3];
  const mobile = lead.mobile || lead.phone || `98${String(700000000 + index * 1000000).slice(0, 10)}`;
  const notes = lead.notes || "Lead details captured in the new CRM workflow.";
  const timeline = lead.timeline?.length ? lead.timeline : [{ stage: "New Lead", date: createdDate }, { stage: workflowStage, date: nextFollowUp }];
  const activities = lead.activities?.length ? lead.activities : [{ type: "Call", text: "Initial discovery completed", date: createdDate }];
  const documents = lead.documents?.length ? lead.documents : (leadType === "Advisor Recruitment" ? ["PAN", "Aadhar"] : ["KYC", "Illustration"]);
  const communication = lead.communication?.length ? lead.communication : [{ type: "WhatsApp", date: createdDate, remarks: "Shared onboarding details" }];
  const tasks = lead.tasks?.length ? lead.tasks : [{ id: `T-${index + 1}`, title: "Prepare follow-up plan", assignedTo, dueDate: nextFollowUp, priority, status: "Open" }];

  return {
    id: lead.id ?? index + 1,
    leadId: lead.leadId || `LD-${1000 + (lead.id ?? index + 1)}`,
    leadType,
    name: lead.name || `Lead ${index + 1}`,
    mobile,
    phone: lead.phone || mobile,
    email: lead.email || `lead${index + 1}@example.com`,
    city: lead.city || ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune"][index % 5],
    workflowStage,
    leadStatus: lead.leadStatus || leadStatuses[index % leadStatuses.length],
    assignedTo,
    leadSource,
    priority,
    nextFollowUp,
    createdDate,
    notes,
    timeline,
    activities,
    documents,
    communication,
    tasks,
    followUp: {
      type: lead.followUp?.type || "Phone Call",
      priority,
      status: lead.followUp?.status || "Pending",
      response: lead.followUp?.response || "Interested"
    },
    source: lead.source || leadSource,
    policyNumber: lead.policyNumber || "",
    advisorCode: lead.advisorCode || ""
  };
}

export const initialLeads = [];

export default initialLeads;
