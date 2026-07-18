import {
  candidates as candTable,
  clients as clientTable,
  performanceRecords as perfTable,
  overridePayoutRecords as overrideTable,
  teamMembers as teamTable,
  settings as settingsTable,
  services as servicesTable
} from "./db.js";

function normalizeLead(lead, index) {
  const leadType = lead.leadType || "Insurance Customer";
  const workflowStage = lead.workflowStage || "New Lead";
  const createdDate = lead.createdDate || new Date().toISOString().slice(0, 10);
  const nextFollowUp = lead.nextFollowUp || "";
  const assignedTo = lead.assignedTo || "";
  const leadSource = lead.leadSource || lead.source || "";
  const priority = lead.priority || "Medium";
  const mobile = lead.mobile || lead.phone || "";
  const notes = lead.notes || "";
  const timeline = lead.timeline || [{ stage: "New Lead", date: createdDate }];
  const activities = lead.activities || [];
  const documents = lead.documents || [];
  const communication = lead.communication || [];
  const tasks = lead.tasks || [];
  const followUp = lead.followUp || { type: "Phone Call", priority, status: "Pending", response: "" };

  return {
    id: lead.id ?? index + 1,
    leadId: lead.leadId || "LD-" + (1000 + (lead.id ?? index + 1)),
    leadType, name: lead.name || "",
    mobile, phone: lead.phone || mobile,
    email: lead.email || "",
    city: lead.city || "",
    workflowStage, leadStatus: lead.leadStatus || "Open",
    assignedTo, leadSource, priority, nextFollowUp, createdDate, notes,
    policyNumber: lead.policyNumber || "",
    advisorCode: lead.advisorCode || "",
    timeline, activities, documents, communication, tasks, followUp,
    source: lead.source || leadSource
  };
}

const initialLeads = [];
const initialClientLeads = [];
const initialPerformanceRecords = [];
const teamMembersData = [];
const defaultSettings = { id: 1, businessName: "", selectedConfigId: "standard", followUpReminderDays: 3, contactEmail: "" };

// Seed
console.log("Seeding database...");

candTable.clear();
initialLeads.forEach((lead, i) => candTable.insert(normalizeLead(lead, i)));
console.log("  Candidates:", candTable.all().length);

clientTable.clear();
initialClientLeads.forEach(c => clientTable.insert(c));
console.log("  Clients:", clientTable.all().length);

perfTable.clear();
initialPerformanceRecords.forEach(r => perfTable.insert(r));
console.log("  Performance records:", perfTable.all().length);

overrideTable.clear();

teamTable.clear();
teamMembersData.forEach(m => teamTable.insert(m));
console.log("  Team members:", teamTable.all().length);

settingsTable.update(defaultSettings);
console.log("  Settings: initialized");

servicesTable.clear();

console.log("Seeding complete!");
