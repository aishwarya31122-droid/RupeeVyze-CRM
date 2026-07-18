export function normalizeLead(lead, index = 0) {
  const leadType = lead.leadType || "Insurance Customer";
  const workflowStage = lead.workflowStage || "New Lead";
  const createdDate = lead.createdDate || new Date().toISOString().slice(0, 10);
  const nextFollowUp = lead.nextFollowUp || "";
  const assignedTo = lead.assignedTo || "";
  const leadSource = lead.leadSource || lead.source || "";
  const priority = lead.priority || "Medium";
  const mobile = lead.mobile || lead.phone || "";
  const notes = lead.notes || "";
  const timeline = lead.timeline?.length ? lead.timeline : [{ stage: "New Lead", date: createdDate }];
  const activities = lead.activities?.length ? lead.activities : [];
  const documents = lead.documents?.length ? lead.documents : [];
  const communication = lead.communication?.length ? lead.communication : [];
  const tasks = lead.tasks?.length ? lead.tasks : [];

  return {
    id: lead.id ?? index + 1,
    leadId: lead.leadId || `LD-${1000 + (lead.id ?? index + 1)}`,
    leadType,
    name: lead.name || "",
    mobile,
    phone: lead.phone || mobile,
    email: lead.email || "",
    city: lead.city || "",
    workflowStage,
    leadStatus: lead.leadStatus || "Open",
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
      response: lead.followUp?.response || ""
    },
    source: lead.source || leadSource,
    policyNumber: lead.policyNumber || "",
    advisorCode: lead.advisorCode || ""
  };
}

export const initialLeads = [];

export default initialLeads;
