export const initialLeads = [
  {
    id: "LD-1001",
    leadId: "LD-1001",
    leadType: "Insurance Customer",
    name: "Aarav Mehta",
    phone: "9876543210",
    email: "aarav.mehta@example.com",
    city: "Mumbai",
    source: "Website",
    assignedTo: "Riya Shah",
    status: "Open",
    stage: "Financial Need Analysis",
    createdDate: "2026-06-12",
    nextFollowUp: "2026-07-09",
    notes: "Looking for family protection with tax benefits.",
    documents: ["KYC", "Illustration"],
    timeline: [
      { stage: "New Lead", date: "2026-06-12" },
      { stage: "Financial Need Analysis", date: "2026-06-13" }
    ],
    activities: [
      { type: "Call", text: "Initial call completed", date: "2026-06-13" }
    ],
    tasks: [
      { id: "T-1", title: "Send illustration", assignedTo: "Riya Shah", dueDate: "2026-06-14", priority: "High", status: "Open" }
    ],
    communication: [
      { type: "WhatsApp", date: "2026-06-13", remarks: "Sent product brochure" }
    ],
    policyNumber: ""
  },
  {
    id: "LD-1002",
    leadId: "LD-1002",
    leadType: "Advisor Recruitment",
    name: "Priya Nair",
    phone: "9123456780",
    email: "priya.nair@example.com",
    city: "Bengaluru",
    source: "Referral",
    assignedTo: "Aman Verma",
    status: "Open",
    stage: "Training",
    createdDate: "2026-06-10",
    nextFollowUp: "2026-07-10",
    notes: "Prefers digital onboarding and wants training schedule.",
    documents: ["PAN", "Aadhar"],
    timeline: [
      { stage: "New Lead", date: "2026-06-10" },
      { stage: "Training", date: "2026-06-20" }
    ],
    activities: [
      { type: "Email", text: "Sent training calendar", date: "2026-06-15" }
    ],
    tasks: [
      { id: "T-2", title: "Schedule training", assignedTo: "Aman Verma", dueDate: "2026-06-18", priority: "Medium", status: "Open" }
    ],
    communication: [
      { type: "Call", date: "2026-06-11", remarks: "Interested in opportunity" }
    ],
    policyNumber: ""
  }
];

export default initialLeads;
