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
  const timeline = lead.timeline || [{ stage: "New Lead", date: createdDate }, { stage: workflowStage, date: nextFollowUp }];
  const activities = lead.activities || [{ type: "Call", text: "Initial discovery completed", date: createdDate }];
  const documents = lead.documents || [];
  const communication = lead.communication || [];
  const tasks = lead.tasks || [];
  const followUp = lead.followUp || { type: "Phone Call", priority, status: "Pending", response: "Interested" };

  return {
    id: lead.id ?? index + 1,
    leadId: lead.leadId || "LD-" + (1000 + (lead.id ?? index + 1)),
    leadType, name: lead.name || "Lead " + (index + 1),
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

const initialLeads = [
  { id: 1, leadId: "LD-1001", leadType: "Advisor Recruitment", leadStatus: "Converted", workflowStage: "Active Client", leadSource: "LinkedIn", name: "Rahul Sharma", mobile: "9876543210", email: "rahul.sharma@example.com", city: "Mumbai", assignedTo: "Aishwarya", createdDate: "2026-05-10", nextFollowUp: "2026-07-20", advisorCode: "ABH-T-1042", notes: "Converted advisor.", timeline: [{ stage: "New Lead", date: "2026-05-10" }, { stage: "Active Client", date: "2026-05-25" }], activities: [{ type: "Call", text: "Activation call completed", date: "2026-05-25" }], documents: ["PAN", "Aadhar"], communication: [{ type: "WhatsApp", date: "2026-05-25", remarks: "Shared onboarding" }], tasks: [{ id: "T-1", title: "Complete onboarding", assignedTo: "Aishwarya", dueDate: "2026-07-20", priority: "High", status: "Done" }], followUp: { type: "Phone Call", priority: "High", status: "Done", response: "Interested" } },
  { id: 2, leadId: "LD-1002", leadType: "Advisor Recruitment", leadStatus: "Converted", workflowStage: "Active Client", leadSource: "Referral", name: "Priya Singh", mobile: "9876543211", email: "priya.singh@example.com", city: "Pune", assignedTo: "Rohan Mehta", createdDate: "2026-05-15", nextFollowUp: "2026-07-18", advisorCode: "ABH-T-1087", notes: "Converted advisor.", timeline: [{ stage: "New Lead", date: "2026-05-15" }, { stage: "Active Client", date: "2026-06-05" }], activities: [{ type: "Call", text: "Activation completed", date: "2026-06-05" }], documents: ["PAN", "License"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Medium", status: "Done", response: "Interested" } },
  { id: 3, leadId: "LD-1003", leadType: "Insurance Customer", leadStatus: "Assigned", workflowStage: "Policy Issued", leadSource: "Website", name: "Amit Kumar", mobile: "9876543212", email: "amit.kumar@example.com", city: "Delhi", assignedTo: "Simran Kaur", createdDate: "2026-05-28", nextFollowUp: "2026-07-24", notes: "Policy issued.", timeline: [{ stage: "New Lead", date: "2026-05-28" }, { stage: "Policy Issued", date: "2026-06-05" }], activities: [{ type: "Meeting", text: "Policy delivery discussed", date: "2026-06-05" }], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" } },
  { id: 4, leadId: "LD-1004", leadType: "Insurance Customer", leadStatus: "Open", workflowStage: "Qualified", leadSource: "Walk-in", name: "Sonal Desai", mobile: "9876543220", email: "sonal.desai@example.com", city: "Ahmedabad", assignedTo: "Aishwarya", createdDate: "2026-06-14", nextFollowUp: "2026-07-16", notes: "Needs comparison.", timeline: [{ stage: "New Lead", date: "2026-06-14" }], activities: [], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } },
  { id: 5, leadId: "LD-1005", leadType: "Advisor Recruitment", leadStatus: "Converted", workflowStage: "Active Client", leadSource: "Facebook", name: "Vikram Patel", mobile: "9876543221", email: "vikram.patel@example.com", city: "Bengaluru", assignedTo: "Rohan Mehta", createdDate: "2026-05-08", nextFollowUp: "2026-07-22", advisorCode: "ABH-T-1203", notes: "Converted advisor.", timeline: [{ stage: "New Lead", date: "2026-05-08" }, { stage: "Active Client", date: "2026-06-01" }], activities: [{ type: "Call", text: "Exam passed and activated", date: "2026-06-01" }], documents: ["PAN", "License"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Medium", status: "Done", response: "Interested" } },
  { id: 6, leadId: "LD-1006", leadType: "Insurance Customer", leadStatus: "Open", workflowStage: "Proposal Submitted", leadSource: "Referral", name: "Neha Gupta", mobile: "9876543222", email: "neha.gupta@example.com", city: "Hyderabad", assignedTo: "Simran Kaur", createdDate: "2026-06-11", nextFollowUp: "2026-07-19", notes: "Proposal submitted.", timeline: [{ stage: "New Lead", date: "2026-06-11" }], activities: [], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } },
  { id: 7, leadId: "LD-1007", leadType: "Insurance Customer", leadStatus: "Assigned", workflowStage: "Financial Need Analysis", leadSource: "LinkedIn", name: "Arjun Singh", mobile: "9876543223", email: "arjun.singh@example.com", city: "Chennai", assignedTo: "Aishwarya", createdDate: "2026-06-16", nextFollowUp: "2026-07-21", notes: "Tailored recommendation needed.", timeline: [{ stage: "New Lead", date: "2026-06-16" }], activities: [], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" } },
  { id: 8, leadId: "LD-1008", leadType: "Advisor Recruitment", leadStatus: "Open", workflowStage: "Interested", leadSource: "Job Portal", name: "Isha Reddy", mobile: "9876543224", email: "isha.reddy@example.com", city: "Pune", assignedTo: "Rohan Mehta", createdDate: "2026-06-18", nextFollowUp: "2026-07-23", notes: "Strong interest.", timeline: [{ stage: "New Lead", date: "2026-06-18" }], activities: [], documents: ["Resume"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } },
  { id: 9, leadId: "LD-1009", leadType: "Insurance Customer", leadStatus: "Lost", workflowStage: "Underwriting", leadSource: "Referral", name: "Rajesh Kumar", mobile: "9876543225", email: "rajesh.kumar@example.com", city: "Kolkata", assignedTo: "Simran Kaur", createdDate: "2026-06-05", nextFollowUp: "2026-07-17", notes: "Lost to competitor.", timeline: [{ stage: "New Lead", date: "2026-06-05" }], activities: [], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Low", status: "Pending", response: "Not ready" } },
  { id: 10, leadId: "LD-1010", leadType: "Insurance Customer", leadStatus: "Converted", workflowStage: "Active Client", leadSource: "Website", name: "Deepa Singh", mobile: "9876543226", email: "deepa.singh@example.com", city: "Jaipur", assignedTo: "Aishwarya", createdDate: "2026-05-21", nextFollowUp: "2026-07-27", notes: "Converted to premium-paying client.", timeline: [{ stage: "New Lead", date: "2026-05-21" }, { stage: "Active Client", date: "2026-06-02" }], activities: [{ type: "Call", text: "Activation completed", date: "2026-06-02" }], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } },
  { id: 11, leadId: "LD-1011", leadType: "Advisor Recruitment", leadStatus: "Converted", workflowStage: "Active Client", leadSource: "Referral", name: "Meera Nair", mobile: "9876543227", email: "meera.nair@example.com", city: "Chennai", assignedTo: "Aishwarya", createdDate: "2026-05-20", nextFollowUp: "2026-07-25", advisorCode: "ABH-T-1256", notes: "Converted advisor.", timeline: [{ stage: "New Lead", date: "2026-05-20" }, { stage: "Active Client", date: "2026-06-08" }], activities: [{ type: "Call", text: "Activated and onboarded", date: "2026-06-08" }], documents: ["PAN", "License"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Done", response: "Interested" } },
  { id: 12, leadId: "LD-1012", leadType: "Advisor Recruitment", leadStatus: "Open", workflowStage: "New Lead", leadSource: "Walk-in", name: "Karan Joshi", mobile: "9876543228", email: "karan.joshi@example.com", city: "Delhi", assignedTo: "Simran Kaur", createdDate: "2026-07-01", nextFollowUp: "2026-07-15", notes: "Walk-in inquiry.", timeline: [{ stage: "New Lead", date: "2026-07-01" }], activities: [], documents: [], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } },
  { id: 13, leadId: "LD-1013", leadType: "Advisor Recruitment", leadStatus: "In Progress", workflowStage: "Training", leadSource: "LinkedIn", name: "Anjali Menon", mobile: "9876543229", email: "anjali.menon@example.com", city: "Bengaluru", assignedTo: "Rohan Mehta", createdDate: "2026-06-25", nextFollowUp: "2026-07-18", notes: "Currently in training.", timeline: [{ stage: "New Lead", date: "2026-06-25" }, { stage: "Training", date: "2026-07-02" }], activities: [], documents: ["PAN"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "Medium", status: "Pending", response: "Interested" } },
  { id: 14, leadId: "LD-1014", leadType: "Insurance Customer", leadStatus: "Assigned", workflowStage: "Product Recommendation", leadSource: "Referral", name: "Suresh Pillai", mobile: "9876543230", email: "suresh.pillai@example.com", city: "Kochi", assignedTo: "Simran Kaur", createdDate: "2026-06-20", nextFollowUp: "2026-07-22", notes: "Referred by existing client.", timeline: [{ stage: "New Lead", date: "2026-06-20" }], activities: [], documents: ["KYC"], communication: [], tasks: [], followUp: { type: "Phone Call", priority: "High", status: "Pending", response: "Interested" } }
];

const initialClientLeads = [
  { id: "CL-1001", clientId: "CLI-2001", name: "Aarav Mehta", mobile: "9876543210", city: "Mumbai", leadSource: "Website", dateReceived: "2026-06-12", assignedTo: "Riya Shah", leadQuality: "Hot", interestLevel: "High", firstCallAttempt: "2026-06-13", callStatus: "Connected", leadResponse: "Interested", policyTypeInterest: "Term Insurance", sumAssuredRequired: "1 Crore", annualPremiumBudget: "\u20B935,000", proposalSent: true, nextFollowUpDate: "2026-07-09", followUpStatus: "Pending", kycStarted: false, policyIssued: false, conversionStage: "Proposal Submitted", finalStatus: "Proposal Submitted", lostDropReason: "", advisorAssigned: "Riya Shah", notes: "Looking for family protection.", leaderName: "Sanjay Rao", advisorName: "Riya Shah", tataAiaCode: "TAI-1102", policies: [{ policyNumber: "PLN-4012", policyType: "Term Insurance", sumAssured: "\u20B91 Crore", premium: 35000, status: "Active", issueDate: "2026-06-15", renewalDate: "2027-06-15" }], claims: [{ claimId: "CLM-201", policyNumber: "PLN-4012", amount: 125000, status: "Approved", settlementDate: "2026-07-02", remarks: "Hospitalization reimbursement" }], renewals: [{ policyNumber: "PLN-4012", dueDate: "2027-06-15", premium: 35000, advisor: "Riya Shah", status: "Upcoming" }], activity: [{ text: "Lead added", time: "2h ago" }, { text: "Proposal submitted", time: "6h ago" }] },
  { id: "CL-1002", clientId: "CLI-2002", name: "Priya Nair", mobile: "9123456780", city: "Bengaluru", leadSource: "Referral", dateReceived: "2026-06-10", assignedTo: "Aman Verma", leadQuality: "Warm", interestLevel: "Medium", firstCallAttempt: "2026-06-11", callStatus: "Callback", leadResponse: "Needs time", policyTypeInterest: "ULIP", sumAssuredRequired: "75 Lakhs", annualPremiumBudget: "\u20B924,000", proposalSent: true, nextFollowUpDate: "2026-07-10", followUpStatus: "Pending", kycStarted: true, policyIssued: false, conversionStage: "Proposal Submitted", finalStatus: "In Progress", lostDropReason: "", advisorAssigned: "Aman Verma", notes: "Prefers digital onboarding.", leaderName: "Meera Iyer", advisorName: "Aman Verma", tataAiaCode: "TAI-1184", policies: [{ policyNumber: "PLN-4021", policyType: "ULIP", sumAssured: "\u20B975 Lakhs", premium: 24000, status: "Pending", issueDate: "2026-06-18", renewalDate: "2027-06-18" }], claims: [{ claimId: "CLM-202", policyNumber: "PLN-4021", amount: 82000, status: "Processing", settlementDate: "2026-07-15", remarks: "Document verification" }], renewals: [{ policyNumber: "PLN-4021", dueDate: "2027-06-18", premium: 24000, advisor: "Aman Verma", status: "Upcoming" }], activity: [{ text: "Lead added", time: "1d ago" }, { text: "KYC initiated", time: "4h ago" }] },
  { id: "CL-1003", clientId: "CLI-2003", name: "Kunal Deshpande", mobile: "9034567890", city: "Pune", leadSource: "Social Media", dateReceived: "2026-06-08", assignedTo: "Neha Joshi", leadQuality: "Cold", interestLevel: "Low", firstCallAttempt: "2026-06-09", callStatus: "No Answer", leadResponse: "Not ready", policyTypeInterest: "Health Insurance", sumAssuredRequired: "50 Lakhs", annualPremiumBudget: "\u20B918,000", proposalSent: false, nextFollowUpDate: "2026-07-12", followUpStatus: "Pending", kycStarted: false, policyIssued: false, conversionStage: "Financial Need Analysis", finalStatus: "Follow-up Pending", lostDropReason: "", advisorAssigned: "Neha Joshi", notes: "Needs more information.", leaderName: "Sanjay Rao", advisorName: "Neha Joshi", tataAiaCode: "TAI-1210", policies: [{ policyNumber: "PLN-4035", policyType: "Health Insurance", sumAssured: "\u20B950 Lakhs", premium: 18000, status: "Pending", issueDate: "2026-06-20", renewalDate: "2027-06-20" }], claims: [{ claimId: "CLM-203", policyNumber: "PLN-4035", amount: 46000, status: "Pending", settlementDate: "2026-07-20", remarks: "Documents pending" }], renewals: [{ policyNumber: "PLN-4035", dueDate: "2027-06-20", premium: 18000, advisor: "Neha Joshi", status: "Upcoming" }], activity: [{ text: "Lead added", time: "2d ago" }] },
  { id: "CL-1004", clientId: "CLI-2004", name: "Sakshi Gupta", mobile: "9988776655", city: "Delhi", leadSource: "Partner Channel", dateReceived: "2026-05-29", assignedTo: "Riya Shah", leadQuality: "Hot", interestLevel: "High", firstCallAttempt: "2026-05-30", callStatus: "Connected", leadResponse: "Ready to buy", policyTypeInterest: "Retirement Plan", sumAssuredRequired: "2 Crores", annualPremiumBudget: "\u20B960,000", proposalSent: true, nextFollowUpDate: "2026-07-08", followUpStatus: "Completed", kycStarted: true, policyIssued: true, conversionStage: "Active Client", finalStatus: "Active Client", lostDropReason: "", advisorAssigned: "Riya Shah", notes: "High-value client.", leaderName: "Meera Iyer", advisorName: "Riya Shah", tataAiaCode: "TAI-1150", policies: [{ policyNumber: "PLN-4048", policyType: "Retirement Plan", sumAssured: "\u20B92 Crores", premium: 60000, status: "In Force", issueDate: "2026-05-31", renewalDate: "2027-05-31" }], claims: [{ claimId: "CLM-204", policyNumber: "PLN-4048", amount: 240000, status: "Approved", settlementDate: "2026-06-20", remarks: "Retirement corpus withdrawal" }], renewals: [{ policyNumber: "PLN-4048", dueDate: "2027-05-31", premium: 60000, advisor: "Riya Shah", status: "Upcoming" }], activity: [{ text: "Policy issued", time: "Today" }, { text: "Client activated", time: "Today" }] },
  { id: "CL-1005", clientId: "CLI-2005", name: "Rohan Bhatia", mobile: "9765432109", city: "Hyderabad", leadSource: "Website", dateReceived: "2026-06-14", assignedTo: "Aman Verma", leadQuality: "Warm", interestLevel: "Medium", firstCallAttempt: "2026-06-15", callStatus: "Connected", leadResponse: "Considering options", policyTypeInterest: "Child Plan", sumAssuredRequired: "80 Lakhs", annualPremiumBudget: "\u20B922,000", proposalSent: true, nextFollowUpDate: "2026-07-11", followUpStatus: "Pending", kycStarted: false, policyIssued: false, conversionStage: "Proposal Submitted", finalStatus: "Proposal Submitted", lostDropReason: "", advisorAssigned: "Aman Verma", notes: "Waiting for spouse confirmation.", leaderName: "Sanjay Rao", advisorName: "Aman Verma", tataAiaCode: "TAI-1120", policies: [{ policyNumber: "PLN-4056", policyType: "Child Plan", sumAssured: "\u20B980 Lakhs", premium: 22000, status: "Active", issueDate: "2026-06-22", renewalDate: "2027-06-22" }], claims: [{ claimId: "CLM-205", policyNumber: "PLN-4056", amount: 18000, status: "Pending", settlementDate: "2026-07-25", remarks: "Premium waiver claim" }], renewals: [{ policyNumber: "PLN-4056", dueDate: "2027-06-22", premium: 22000, advisor: "Aman Verma", status: "Upcoming" }], activity: [{ text: "Lead added", time: "Today" }] },
  { id: "CL-1006", clientId: "CLI-2006", name: "Nisha Kapoor", mobile: "9898123456", city: "Chennai", leadSource: "Call Center", dateReceived: "2026-06-16", assignedTo: "Neha Joshi", leadQuality: "Cold", interestLevel: "Low", firstCallAttempt: "2026-06-17", callStatus: "Not Interested", leadResponse: "Budget concerns", policyTypeInterest: "Savings Plan", sumAssuredRequired: "40 Lakhs", annualPremiumBudget: "\u20B912,000", proposalSent: false, nextFollowUpDate: "2026-07-07", followUpStatus: "Overdue", kycStarted: false, policyIssued: false, conversionStage: "New Lead", finalStatus: "Lost", lostDropReason: "Budget mismatch.", advisorAssigned: "Neha Joshi", notes: "Lower premium needed.", leaderName: "Meera Iyer", advisorName: "Neha Joshi", tataAiaCode: "TAI-1265", policies: [{ policyNumber: "PLN-4062", policyType: "Savings Plan", sumAssured: "\u20B940 Lakhs", premium: 12000, status: "Lapsed", issueDate: "2026-06-10", renewalDate: "2026-09-10" }], claims: [{ claimId: "CLM-206", policyNumber: "PLN-4062", amount: 15000, status: "Rejected", settlementDate: "2026-06-24", remarks: "Policy lapsed" }], renewals: [{ policyNumber: "PLN-4062", dueDate: "2026-09-10", premium: 12000, advisor: "Neha Joshi", status: "Overdue" }], activity: [{ text: "Lead added", time: "2d ago" }, { text: "Lead marked as lost", time: "Today" }] }
];

const initialPerformanceRecords = [
  { id: "PERF-001", adviserId: 1, advisorName: "Rahul Sharma", advisorCode: "ABH-T-1042", month: "2026-05", policiesSold: 4, premiumCollected: 186000, persistency: 94, monthlyTarget: 150000, remarks: "Strong start" },
  { id: "PERF-002", adviserId: 1, advisorName: "Rahul Sharma", advisorCode: "ABH-T-1042", month: "2026-06", policiesSold: 5, premiumCollected: 210000, persistency: 96, monthlyTarget: 200000, remarks: "Excellent month" },
  { id: "PERF-003", adviserId: 2, advisorName: "Priya Singh", advisorCode: "ABH-T-1087", month: "2026-06", policiesSold: 3, premiumCollected: 142000, persistency: 98, monthlyTarget: 150000, remarks: "Consistent performer" },
  { id: "PERF-004", adviserId: 5, advisorName: "Vikram Patel", advisorCode: "ABH-T-1203", month: "2026-06", policiesSold: 6, premiumCollected: 320000, persistency: 92, monthlyTarget: 250000, remarks: "Top performer" },
  { id: "PERF-005", adviserId: 11, advisorName: "Meera Nair", advisorCode: "ABH-T-1256", month: "2026-06", policiesSold: 2, premiumCollected: 88000, persistency: 100, monthlyTarget: 100000, remarks: "Good start" },
  { id: "PERF-006", adviserId: 1, advisorName: "Rahul Sharma", advisorCode: "ABH-T-1042", month: "2026-07", policiesSold: 4, premiumCollected: 195000, persistency: 95, monthlyTarget: 200000, remarks: "Steady performance" },
  { id: "PERF-007", adviserId: 5, advisorName: "Vikram Patel", advisorCode: "ABH-T-1203", month: "2026-07", policiesSold: 7, premiumCollected: 380000, persistency: 91, monthlyTarget: 300000, remarks: "Exceeded target" }
];

const teamMembersData = [
  { id: 1, name: "Aishwarya", role: "Recruiter", status: "Active", email: "aishwarya@apexrecruit.com", phone: "9876501234" },
  { id: 2, name: "Rohan Mehta", role: "Operations", status: "Active", email: "rohan@apexrecruit.com", phone: "9876505678" },
  { id: 3, name: "Simran Kaur", role: "Trainer", status: "On Leave", email: "simran@apexrecruit.com", phone: "9876509012" }
];

const defaultSettings = { id: 1, businessName: "Apex Recruitment", selectedConfigId: "standard", followUpReminderDays: 3, contactEmail: "support@apexrecruit.com" };

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
const serviceRequests = [];
initialClientLeads.forEach(c => {
  serviceRequests.push({ serviceType: "Policy Review", clientName: c.name, clientId: c.clientId, assignedTo: c.advisorAssigned, status: c.finalStatus === "Active Client" ? "Resolved" : c.finalStatus === "Lost" ? "Escalated" : "In Progress", priority: c.interestLevel || "Medium", createdDate: c.dateReceived, notes: "Policy review for " + c.name });
  serviceRequests.push({ serviceType: "Renewal Reminder", clientName: c.name, clientId: c.clientId, assignedTo: c.advisorAssigned, status: c.followUpStatus === "Completed" ? "Resolved" : c.followUpStatus === "Overdue" ? "Escalated" : "Open", priority: c.leadQuality === "Hot" ? "High" : "Medium", createdDate: c.nextFollowUpDate || c.dateReceived, notes: "Renewal reminder for " + c.name });
});
serviceRequests.forEach(s => servicesTable.insert(s));
console.log("  Service requests:", servicesTable.all().length);

console.log("Seeding complete!");
