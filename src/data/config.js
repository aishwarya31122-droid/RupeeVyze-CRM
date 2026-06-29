export const businessConfigs = [
  {
    id: "standard",
    name: "Standard Recruitment",
    recruiter: "Team A",
    defaultSource: "Referral",
    followUpWindowDays: 7,
    description: "Balanced hiring with consistent follow-up cadence."
  },
  {
    id: "fast-track",
    name: "Fast Track Onboarding",
    recruiter: "Team B",
    defaultSource: "LinkedIn",
    followUpWindowDays: 3,
    description: "Accelerated candidate movement with frequent action."
  },
  {
    id: "corporate",
    name: "Corporate Drive",
    recruiter: "Team C",
    defaultSource: "Walk-in",
    followUpWindowDays: 10,
    description: "Enterprise-focused intake with longer qualification windows."
  }
];

export const defaultBusinessSettings = {
  businessName: "Apex Recruitment",
  selectedConfigId: "standard",
  followUpReminderDays: 3,
  contactEmail: "support@apexrecruit.com"
};
