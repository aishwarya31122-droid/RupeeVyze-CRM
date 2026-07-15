import test from "node:test";
import assert from "node:assert/strict";
import { prepareLeadForSave } from "../workflow.js";

test("advisor activation creates activation events and performance payload", () => {
  const existing = {
    id: 10,
    leadId: "LD-1010",
    name: "Riya Shah",
    leadType: "Advisor Recruitment",
    workflowStage: "Exam",
    leadStatus: "Open",
    assignedTo: "Aishwarya",
    leadSource: "Referral",
    createdDate: "2026-07-10",
    nextFollowUp: "2026-07-15",
    documents: [],
    timeline: [],
    activities: [],
    tasks: [],
    followUp: { status: "Pending", response: "Interested" }
  };

  const result = prepareLeadForSave(existing, { workflowStage: "Business Started", leadStatus: "Converted" });

  assert.equal(result.lead.leadStatus, "Converted");
  assert.equal(result.shouldCreateAdvisorRecord, true);
  assert.equal(result.shouldCreatePerformanceRecord, true);
  assert.match(result.lead.timeline.at(-1).stage, /Advisor Activated/);
  assert.match(result.lead.activities.at(-1).text, /Advisor Activated/);
  assert.equal(result.performancePayload.advisorName, "Riya Shah");
});

test("policy issuance creates a client payload and logs policy issuance", () => {
  const existing = {
    id: 20,
    leadId: "LD-1020",
    name: "Amit Kumar",
    leadType: "Insurance Customer",
    workflowStage: "Proposal Submitted",
    leadStatus: "Open",
    assignedTo: "Simran",
    leadSource: "Website",
    createdDate: "2026-07-11",
    nextFollowUp: "2026-07-16",
    documents: ["KYC"],
    timeline: [],
    activities: [],
    tasks: [],
    followUp: { status: "Pending", response: "Interested" }
  };

  const result = prepareLeadForSave(existing, { workflowStage: "Policy Issued", leadStatus: "Converted" });

  assert.equal(result.shouldCreateClientRecord, true);
  assert.equal(result.clientPayload.name, "Amit Kumar");
  assert.equal(result.clientPayload.policyIssued, true);
  assert.match(result.lead.timeline.at(-1).stage, /Policy Issued/);
  assert.match(result.lead.activities.at(-1).text, /Policy Issued/);
});
