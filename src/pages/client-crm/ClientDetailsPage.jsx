import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { initialClientLeads } from "../../data/clientCrmData";

function ClientDetailsPage({ leads = initialClientLeads, onEditLead }) {
  const { id } = useParams();
  const lead = useMemo(() => leads.find((entry) => entry.id === id) || leads[0], [id, leads]);

  if (!lead) {
    return <div className="card">No client record found.</div>;
  }

  const sections = [
    { title: "Personal Information", items: [
      ["Lead ID", lead.id],
      ["Full Name", lead.name],
      ["Mobile", lead.mobile],
      ["City", lead.city]
    ]},
    { title: "Qualification", items: [
      ["Lead Source", lead.leadSource],
      ["Date Received", lead.dateReceived],
      ["Assigned To", lead.assignedTo],
      ["Lead Quality", lead.leadQuality],
      ["Interest Level", lead.interestLevel]
    ]},
    { title: "Call Tracking", items: [
      ["First Call Attempt", lead.firstCallAttempt],
      ["Call Status", lead.callStatus],
      ["Lead Response", lead.leadResponse]
    ]},
    { title: "Needs Analysis", items: [
      ["Policy Type Interest", lead.policyTypeInterest],
      ["Sum Assured Required", lead.sumAssuredRequired],
      ["Annual Premium Budget", lead.annualPremiumBudget]
    ]},
    { title: "Progression", items: [
      ["Proposal Sent", lead.proposalSent ? "Yes" : "No"],
      ["Next Follow-up Date", lead.nextFollowUpDate],
      ["Current Stage", lead.conversionStage]
    ]},
    { title: "Onboarding", items: [
      ["KYC Started", lead.kycStarted ? "Yes" : "No"],
      ["Policy Issued", lead.policyIssued ? "Yes" : "No"]
    ]},
    { title: "Outcome", items: [
      ["Conversion Stage", lead.conversionStage],
      ["Final Status", lead.finalStatus],
      ["Client ID", lead.clientId || "Pending"],
      ["Lost / Drop Reason", lead.lostDropReason || "—"]
    ]},
    { title: "Administration", items: [
      ["Advisor Assigned", lead.advisorAssigned],
      ["Notes / Objections", lead.notes]
    ]},
    { title: "Hierarchy", items: [
      ["Leader Name", lead.leaderName],
      ["Advisor Name", lead.advisorName],
      ["TATA AIA Code", lead.tataAiaCode]
    ]}
  ];

  return (
    <div className="client-details-page">
      <div className="page-header">
        <div>
          <h1>{lead.name}</h1>
          <p>360° client view for internal insurance operations.</p>
        </div>
        <div className="header-summary">
          <span className="badge" style={{ background: lead.finalStatus === "Converted" ? "#166534" : lead.finalStatus === "Lost" ? "#dc2626" : "#2563eb" }}>{lead.finalStatus}</span>
          <Link className="button primary" to={`/client-crm/edit/${lead.id}`}>Edit Client</Link>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        {sections.map((section) => (
          <div key={section.title} className="card detail-card">
            <h3>{section.title}</h3>
            <div className="detail-grid-stack">
              {section.items.map(([label, value]) => (
                <div key={label} className="detail-item">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Client Timeline</h3>
        <div className="timeline">
          {['Lead Received', 'Qualified', 'First Call', 'Needs Analysis', 'Proposal Sent', 'KYC Started', 'Policy Issued', 'Converted'].map((stage, index) => {
            const completed = ["Lead Received", "Qualified", "First Call", "Needs Analysis", "Proposal Sent", "KYC Started", "Policy Issued", "Converted"].indexOf(lead.conversionStage);
            const isCurrent = stage === lead.conversionStage;
            const isComplete = index < completed;
            return (
              <div key={stage} className={`timeline-step ${isComplete ? "complete" : ""} ${isCurrent ? "current" : ""}`}>
                <span>{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ClientDetailsPage;
