export const initialClientLeads = [
  {
    id: "CL-1001",
    name: "Aarav Mehta",
    mobile: "9876543210",
    city: "Mumbai",
    leadSource: "Website",
    dateReceived: "2026-06-12",
    assignedTo: "Riya Shah",
    leadQuality: "Hot",
    interestLevel: "High",
    firstCallAttempt: "2026-06-13",
    callStatus: "Connected",
    leadResponse: "Interested",
    policyTypeInterest: "Term Insurance",
    sumAssuredRequired: "1 Crore",
    annualPremiumBudget: "₹35,000",
    proposalSent: true,
    nextFollowUpDate: "2026-07-09",
    followUpStatus: "Pending",
    kycStarted: false,
    policyIssued: false,
    conversionStage: "Proposal Submitted",
    finalStatus: "Proposal Submitted",
    clientId: "CLI-2001",
    lostDropReason: "",
    advisorAssigned: "Riya Shah",
    notes: "Looking for family protection with tax benefits.",
    leaderName: "Sanjay Rao",
    advisorName: "Riya Shah",
    tataAiaCode: "TAI-1102",
    policies: [
      { policyNumber: "PLN-4012", policyType: "Term Insurance", sumAssured: "₹1 Crore", premium: 35000, status: "Active", issueDate: "2026-06-15", renewalDate: "2027-06-15" }
    ],
    claims: [
      { claimId: "CLM-201", policyNumber: "PLN-4012", amount: 125000, status: "Approved", settlementDate: "2026-07-02", remarks: "Hospitalization reimbursement completed" }
    ],
    renewals: [
      { policyNumber: "PLN-4012", dueDate: "2027-06-15", premium: 35000, advisor: "Riya Shah", status: "Upcoming" }
    ],
    activity: [
      { text: "Lead added", time: "2h ago" },
      { text: "Proposal submitted", time: "6h ago" },
      { text: "Follow-up scheduled", time: "Yesterday" },
    ],
  },

  {
    id: "CL-1002",
    name: "Priya Nair",
    mobile: "9123456780",
    city: "Bengaluru",
    leadSource: "Referral",
    dateReceived: "2026-06-10",
    assignedTo: "Aman Verma",
    leadQuality: "Warm",
    interestLevel: "Medium",
    firstCallAttempt: "2026-06-11",
    callStatus: "Callback",
    leadResponse: "Needs time",
    policyTypeInterest: "ULIP",
    sumAssuredRequired: "75 Lakhs",
    annualPremiumBudget: "₹24,000",
    proposalSent: true,
    nextFollowUpDate: "2026-07-10",
    followUpStatus: "Pending",
    kycStarted: true,
    policyIssued: false,
    conversionStage: "Proposal Submitted",
    finalStatus: "In Progress",
    clientId: "CLI-2002",
    lostDropReason: "",
    advisorAssigned: "Aman Verma",
    notes: "Prefers digital onboarding and wants a premium return plan.",
    leaderName: "Meera Iyer",
    advisorName: "Aman Verma",
    tataAiaCode: "TAI-1184",
    policies: [
      { policyNumber: "PLN-4021", policyType: "ULIP", sumAssured: "₹75 Lakhs", premium: 24000, status: "Pending", issueDate: "2026-06-18", renewalDate: "2027-06-18" }
    ],
    claims: [
      { claimId: "CLM-202", policyNumber: "PLN-4021", amount: 82000, status: "Processing", settlementDate: "2026-07-15", remarks: "Claim document verification in progress" }
    ],
    renewals: [
      { policyNumber: "PLN-4021", dueDate: "2027-06-18", premium: 24000, advisor: "Aman Verma", status: "Upcoming" }
    ],
    activity: [
      { text: "Lead added", time: "1d ago" },
      { text: "KYC initiated", time: "4h ago" },
      { text: "Follow-up scheduled", time: "Today" },
    ],
  },

  {
    id: "CL-1003",
    name: "Kunal Deshpande",
    mobile: "9034567890",
    city: "Pune",
    leadSource: "Social Media",
    dateReceived: "2026-06-08",
    assignedTo: "Neha Joshi",
    leadQuality: "Cold",
    interestLevel: "Low",
    firstCallAttempt: "2026-06-09",
    callStatus: "No Answer",
    leadResponse: "Not ready",
    policyTypeInterest: "Health Insurance",
    sumAssuredRequired: "50 Lakhs",
    annualPremiumBudget: "₹18,000",
    proposalSent: false,
    nextFollowUpDate: "2026-07-12",
    followUpStatus: "Pending",
    kycStarted: false,
    policyIssued: false,
    conversionStage: "Financial Need Analysis",
    finalStatus: "Follow-up Pending",
    clientId: "",
    lostDropReason: "",
    advisorAssigned: "Neha Joshi",
    notes: "Needs more information and budget planning.",
    leaderName: "Sanjay Rao",
    advisorName: "Neha Joshi",
    tataAiaCode: "TAI-1210",
    policies: [
      { policyNumber: "PLN-4035", policyType: "Health Insurance", sumAssured: "₹50 Lakhs", premium: 18000, status: "Pending", issueDate: "2026-06-20", renewalDate: "2027-06-20" }
    ],
    claims: [
      { claimId: "CLM-203", policyNumber: "PLN-4035", amount: 46000, status: "Pending", settlementDate: "2026-07-20", remarks: "Claim documents pending" }
    ],
    renewals: [
      { policyNumber: "PLN-4035", dueDate: "2027-06-20", premium: 18000, advisor: "Neha Joshi", status: "Upcoming" }
    ],
    activity: [
      { text: "Lead added", time: "2d ago" },
      { text: "Financial need analysis logged", time: "Yesterday" },
    ],
  },

  {
    id: "CL-1004",
    name: "Sakshi Gupta",
    mobile: "9988776655",
    city: "Delhi",
    leadSource: "Partner Channel",
    dateReceived: "2026-05-29",
    assignedTo: "Riya Shah",
    leadQuality: "Hot",
    interestLevel: "High",
    firstCallAttempt: "2026-05-30",
    callStatus: "Connected",
    leadResponse: "Ready to buy",
    policyTypeInterest: "Retirement Plan",
    sumAssuredRequired: "2 Crores",
    annualPremiumBudget: "₹60,000",
    proposalSent: true,
    nextFollowUpDate: "2026-07-08",
    followUpStatus: "Completed",
    kycStarted: true,
    policyIssued: true,
    conversionStage: "Active Client",
    finalStatus: "Active Client",
    clientId: "CLI-2004",
    lostDropReason: "",
    advisorAssigned: "Riya Shah",
    notes: "High-value client with immediate policy need.",
    leaderName: "Meera Iyer",
    advisorName: "Riya Shah",
    tataAiaCode: "TAI-1150",
    policies: [
      { policyNumber: "PLN-4048", policyType: "Retirement Plan", sumAssured: "₹2 Crores", premium: 60000, status: "In Force", issueDate: "2026-05-31", renewalDate: "2027-05-31" }
    ],
    claims: [
      { claimId: "CLM-204", policyNumber: "PLN-4048", amount: 240000, status: "Approved", settlementDate: "2026-06-20", remarks: "Retirement corpus withdrawal approved" }
    ],
    renewals: [
      { policyNumber: "PLN-4048", dueDate: "2027-05-31", premium: 60000, advisor: "Riya Shah", status: "Upcoming" }
    ],
    activity: [
      { text: "Policy issued", time: "Today" },
      { text: "Proposal submitted", time: "3d ago" },
      { text: "Client activated", time: "Today" },
    ],
  },

  {
    id: "CL-1005",
    name: "Rohan Bhatia",
    mobile: "9765432109",
    city: "Hyderabad",
    leadSource: "Website",
    dateReceived: "2026-06-14",
    assignedTo: "Aman Verma",
    leadQuality: "Warm",
    interestLevel: "Medium",
    firstCallAttempt: "2026-06-15",
    callStatus: "Connected",
    leadResponse: "Considering options",
    policyTypeInterest: "Child Plan",
    sumAssuredRequired: "80 Lakhs",
    annualPremiumBudget: "₹22,000",
    proposalSent: true,
    nextFollowUpDate: "2026-07-11",
    followUpStatus: "Pending",
    kycStarted: false,
    policyIssued: false,
    conversionStage: "Proposal Submitted",
    finalStatus: "Proposal Submitted",
    clientId: "",
    lostDropReason: "",
    advisorAssigned: "Aman Verma",
    notes: "Interested but waiting for spouse confirmation.",
    leaderName: "Sanjay Rao",
    advisorName: "Aman Verma",
    tataAiaCode: "TAI-1120",
    policies: [
      { policyNumber: "PLN-4056", policyType: "Child Plan", sumAssured: "₹80 Lakhs", premium: 22000, status: "Active", issueDate: "2026-06-22", renewalDate: "2027-06-22" }
    ],
    claims: [
      { claimId: "CLM-205", policyNumber: "PLN-4056", amount: 18000, status: "Pending", settlementDate: "2026-07-25", remarks: "Claim request logged for premium waiver" }
    ],
    renewals: [
      { policyNumber: "PLN-4056", dueDate: "2027-06-22", premium: 22000, advisor: "Aman Verma", status: "Upcoming" }
    ],
    activity: [
      { text: "Lead added", time: "Today" },
      { text: "Proposal submitted", time: "Today" },
    ],
  },

  {
    id: "CL-1006",
    name: "Nisha Kapoor",
    mobile: "9898123456",
    city: "Chennai",
    leadSource: "Call Center",
    dateReceived: "2026-06-16",
    assignedTo: "Neha Joshi",
    leadQuality: "Cold",
    interestLevel: "Low",
    firstCallAttempt: "2026-06-17",
    callStatus: "Not Interested",
    leadResponse: "Budget concerns",
    policyTypeInterest: "Savings Plan",
    sumAssuredRequired: "40 Lakhs",
    annualPremiumBudget: "₹12,000",
    proposalSent: false,
    nextFollowUpDate: "2026-07-07",
    followUpStatus: "Overdue",
    kycStarted: false,
    policyIssued: false,
    conversionStage: "New Lead",
    finalStatus: "Lost",
    clientId: "",
    lostDropReason: "Budget mismatch and no response.",
    advisorAssigned: "Neha Joshi",
    notes: "Needs a lower premium product and follow-up later.",
    leaderName: "Meera Iyer",
    advisorName: "Neha Joshi",
    tataAiaCode: "TAI-1265",
    policies: [
      { policyNumber: "PLN-4062", policyType: "Savings Plan", sumAssured: "₹40 Lakhs", premium: 12000, status: "Lapsed", issueDate: "2026-06-10", renewalDate: "2026-09-10" }
    ],
    claims: [
      { claimId: "CLM-206", policyNumber: "PLN-4062", amount: 15000, status: "Rejected", settlementDate: "2026-06-24", remarks: "Policy lapsed before claim submission" }
    ],
    renewals: [
      { policyNumber: "PLN-4062", dueDate: "2026-09-10", premium: 12000, advisor: "Neha Joshi", status: "Overdue" }
    ],
    activity: [
      { text: "Lead added", time: "2d ago" },
      { text: "Lead marked as lost", time: "Today" },
    ],
  },
];