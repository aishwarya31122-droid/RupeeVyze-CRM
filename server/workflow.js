const buildTimelineEntry = (stage, date) => ({ stage, date });
const buildActivityEntry = (type, text, date) => ({ type, text, date });

function ensureTimeline(lead, stage, date) {
  const timeline = Array.isArray(lead.timeline) ? [...lead.timeline] : [];
  const hasEntry = timeline.some((entry) => entry?.stage === stage);
  if (!hasEntry) {
    timeline.push(buildTimelineEntry(stage, date));
  }
  return timeline;
}

function ensureActivity(lead, type, text, date) {
  const activities = Array.isArray(lead.activities) ? [...lead.activities] : [];
  const hasEntry = activities.some((entry) => entry?.text === text);
  if (!hasEntry) {
    activities.push(buildActivityEntry(type, text, date));
  }
  return activities;
}

function normalizeDate(dateValue) {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  const value = new Date(dateValue);
  return Number.isNaN(value.getTime()) ? new Date().toISOString().slice(0, 10) : value.toISOString().slice(0, 10);
}

function ensureDefaultTask(lead, updates, date) {
  const tasks = Array.isArray(lead.tasks) ? [...lead.tasks] : [];
  if (tasks.length > 0) return tasks;
  const followUpDate = updates.nextFollowUp || lead.nextFollowUp || date;
  const stageLabel = updates.workflowStage || lead.workflowStage || "New Lead";
  tasks.push({
    id: `T-${Date.now()}`,
    title: `Follow up for ${stageLabel}`,
    assignedTo: lead.assignedTo || "Unassigned",
    dueDate: followUpDate,
    priority: lead.priority || lead.followUp?.priority || "Medium",
    status: "Open",
    notes: `Auto-generated follow-up task for ${lead.name || "the lead"}`
  });
  return tasks;
}

function buildLeadPayload(lead, updates, options = {}) {
  const nextLead = {
    ...lead,
    ...updates,
    workflowStage: updates.workflowStage || lead.workflowStage || "New Lead",
    leadStatus: updates.leadStatus || lead.leadStatus || "Open",
    nextFollowUp: updates.nextFollowUp || lead.nextFollowUp || "",
    followUp: updates.followUp || lead.followUp || { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" }
  };

  const stageChanged = Boolean(updates.workflowStage && updates.workflowStage !== lead.workflowStage);
  const date = normalizeDate(updates.updatedAt || updates.createdDate || new Date().toISOString());
  let timeline = Array.isArray(nextLead.timeline) ? [...nextLead.timeline] : [];
  let activities = Array.isArray(nextLead.activities) ? [...nextLead.activities] : [];

  if (options.isCreate) {
    timeline = ensureTimeline(nextLead, "Lead Created", date);
    activities = ensureActivity(nextLead, "Lead", "Lead Created", date);
  }

  if (stageChanged) {
    timeline = ensureTimeline(nextLead, `Stage Changed: ${updates.workflowStage}`, date);
    activities = ensureActivity(nextLead, "Stage", `Stage changed to ${updates.workflowStage}`, date);
  }

  if (updates.documents && Array.isArray(lead.documents) && updates.documents.length > lead.documents.length) {
    timeline = ensureTimeline(nextLead, "Document Uploaded", date);
    activities = ensureActivity(nextLead, "Document", "Document uploaded", date);
  }

  const previousTasks = Array.isArray(lead.tasks) ? lead.tasks : [];
  const nextTasks = Array.isArray(updates.tasks) ? updates.tasks : (Array.isArray(nextLead.tasks) ? nextLead.tasks : []);
  const completedTaskTransition = nextTasks.some((task) => ["Done", "Completed"].includes(task?.status)) && previousTasks.some((task) => !["Done", "Completed"].includes(task?.status));
  if (completedTaskTransition) {
    timeline = ensureTimeline(nextLead, "Task Completed", date);
    activities = ensureActivity(nextLead, "Task", "Task completed", date);
  }

  const followUpTasks = ensureDefaultTask(nextLead, updates, date);
  nextLead.tasks = nextTasks.length ? nextTasks : followUpTasks;
  nextLead.timeline = timeline;
  nextLead.activities = activities;
  return nextLead;
}

export function prepareLeadForSave(lead, updates = {}, options = {}) {
  const baseDate = normalizeDate(updates.updatedAt || updates.createdDate || lead.createdDate || new Date().toISOString());
  const nextLead = buildLeadPayload(lead, { ...updates, updatedAt: baseDate }, options);

  const isAdvisorLead = nextLead.leadType === "Advisor";
  const isCustomerLead = nextLead.leadType === "Insurance Customer";
  const advisorActivated = isAdvisorLead && ["Business Started", "Activation", "Activated", "Activated Advisor"].includes(nextLead.workflowStage);
  const policyIssued = isCustomerLead && ["Policy Issued", "Active Client"].includes(nextLead.workflowStage);

  const timelineEntries = Array.isArray(nextLead.timeline) ? nextLead.timeline : [];
  const activityEntries = Array.isArray(nextLead.activities) ? nextLead.activities : [];

  if (advisorActivated) {
    timelineEntries.push({ stage: "Advisor Activated", date: baseDate });
    activityEntries.push({ type: "Advisor", text: "Advisor Activated", date: baseDate });
    nextLead.leadStatus = "Converted";
  }

  if (policyIssued) {
    timelineEntries.push({ stage: "Policy Issued", date: baseDate });
    activityEntries.push({ type: "Policy", text: "Policy Issued", date: baseDate });
    nextLead.leadStatus = "Converted";
  }

  nextLead.timeline = timelineEntries;
  nextLead.activities = activityEntries;

  const performancePayload = advisorActivated ? {
    advisorName: nextLead.name,
    advisorCode: nextLead.advisorCode || `ADV-${String(nextLead.id).padStart(3, "0")}`,
    month: baseDate.slice(0, 7),
    policiesSold: 0,
    premiumCollected: 0,
    persistency: 100,
    monthlyTarget: 100000,
    remarks: "Auto-generated from lead activation"
  } : null;

  const clientPayload = policyIssued ? {
    id: `CL-${String(nextLead.id).padStart(4, "0")}`,
    clientId: `CLI-${String(2000 + nextLead.id).padStart(4, "0")}`,
    name: nextLead.name,
    mobile: nextLead.mobile || nextLead.phone,
    city: nextLead.city || "",
    email: nextLead.email || "",
    leadSource: nextLead.leadSource || nextLead.source || "Referral",
    advisorAssigned: nextLead.assignedTo || "Unassigned",
    dateReceived: nextLead.createdDate || baseDate,
    leadQuality: "Warm",
    interestLevel: "Medium",
    firstCallAttempt: baseDate,
    callStatus: "Connected",
    leadResponse: nextLead.followUp?.response || "Interested",
    policyTypeInterest: "Portfolio Review",
    sumAssuredRequired: "—",
    annualPremiumBudget: "—",
    proposalSent: true,
    nextFollowUpDate: nextLead.nextFollowUp || baseDate,
    followUpStatus: "Pending",
    kycStarted: true,
    policyIssued: true,
    conversionStage: "Policy Issued",
    finalStatus: "Active Client",
    lostDropReason: "",
    advisorName: nextLead.assignedTo || "Unassigned",
    notes: nextLead.notes || "Auto-created from lead workflow",
    policies: [{
      policyNumber: `PLN-${String(nextLead.id).padStart(4, "0")}`,
      policyType: "Insurance",
      sumAssured: "—",
      premium: 0,
      status: "Active",
      issueDate: baseDate,
      renewalDate: baseDate
    }],
    claims: [],
    renewals: [],
    activity: [{ text: "Lead converted into client", time: baseDate }]
  } : null;

  return {
    lead: nextLead,
    shouldCreateAdvisorRecord: Boolean(advisorActivated),
    shouldCreateClientRecord: Boolean(policyIssued),
    shouldCreatePerformanceRecord: Boolean(advisorActivated),
    performancePayload,
    clientPayload
  };
}
