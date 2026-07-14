import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { initialClientLeads } from "../../data/clientCrmData";

const detailTabs = [
  "Overview",
  "Timeline",
  "Activities",
  "Documents",
  "Follow-ups",
  "Policy Details",
];

const clientWorkflow = [
  "New Lead",
  "Qualified",
  "Financial Need Analysis",
  "Product Recommendation",
  "Illustration Shared",
  "Proposal Submitted",
  "Medical",
  "Underwriting",
  "Policy Issued",
  "Premium Collected",
  "Active Client",
];

function ClientDetailsPage({ leads = initialClientLeads }) {
  const { id } = useParams();

  const lead = useMemo(
    () => leads.find((entry) => entry.id === id) || leads[0],
    [id, leads]
  );

  const [activeTab, setActiveTab] = useState("Overview");

  if (!lead) {
    return <div className="card">No client record found.</div>;
  }

  const sections = [
    {
      title: "Personal Information",
      items: [
        ["Lead ID", lead.id],
        ["Client ID", lead.clientId || "Pending"],
        ["Full Name", lead.name],
        ["Mobile", lead.mobile],
        ["City", lead.city],
      ],
    },
    {
      title: "Lead Qualification",
      items: [
        ["Lead Source", lead.leadSource],
        ["Date Received", lead.dateReceived],
        ["Assigned To", lead.assignedTo],
        ["Lead Quality", lead.leadQuality],
        ["Interest Level", lead.interestLevel],
      ],
    },
    {
      title: "Contact Tracking",
      items: [
        ["First Call Attempt", lead.firstCallAttempt],
        ["Call Status", lead.callStatus],
        ["Lead Response", lead.leadResponse],
      ],
    },
    {
      title: "Insurance Need Analysis",
      items: [
        ["Policy Type Interest", lead.policyTypeInterest],
        ["Sum Assured Required", lead.sumAssuredRequired],
        ["Annual Premium Budget", lead.annualPremiumBudget],
      ],
    },
    {
      title: "Insurance Progress",
      items: [
        ["Proposal Submitted", lead.proposalSent ? "Yes" : "No"],
        ["KYC Started", lead.kycStarted ? "Yes" : "No"],
        ["Policy Issued", lead.policyIssued ? "Yes" : "No"],
        ["Current Stage", lead.conversionStage],
      ],
    },
    {
      title: "Follow-up",
      items: [
        ["Next Follow-up Date", lead.nextFollowUpDate],
        ["Follow-up Status", lead.followUpStatus],
      ],
    },
    {
      title: "Outcome",
      items: [
        ["Final Status", lead.finalStatus],
        ["Lost / Drop Reason", lead.lostDropReason || "—"],
      ],
    },
    {
      title: "Advisor & Administration",
      items: [
        ["Advisor Assigned", lead.advisorAssigned],
        ["Leader Name", lead.leaderName],
        ["Advisor Name", lead.advisorName],
        ["TATA AIA Code", lead.tataAiaCode],
        ["Notes / Objections", lead.notes],
      ],
    },
  ];

  const getCurrentWorkflowIndex = () => {
    const stageMap = {
      "Lead Received": "New Lead",
      "First Call": "New Lead",
      "Needs Analysis": "Financial Need Analysis",
      "Proposal Sent": "Proposal Submitted",
      "KYC Started": "Proposal Submitted",
      Converted: "Active Client",
    };

    const currentStage =
      stageMap[lead.conversionStage] || lead.conversionStage;

    const index = clientWorkflow.indexOf(currentStage);

    return index >= 0 ? index : 0;
  };

  const currentWorkflowIndex = getCurrentWorkflowIndex();

  return (
    <div className="client-details-page">
      <div className="page-header">
        <div>
          <h1>{lead.name}</h1>
          <p>
            360° insurance client profile for lead, policy and follow-up
            operations.
          </p>
        </div>

        <div className="header-summary">
          <span
            className="badge"
            style={{
              background:
                lead.finalStatus === "Converted"
                  ? "#166534"
                  : lead.finalStatus === "Lost"
                  ? "#dc2626"
                  : "#2563eb",
            }}
          >
            {lead.finalStatus}
          </span>

          <Link
            className="button primary"
            to={`/client-crm/edit/${lead.id}`}
          >
            Edit Client
          </Link>
        </div>
      </div>

      <div className="tab-row">
        {detailTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${
              activeTab === tab ? "active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <>
          <div className="card-grid card-grid-2">
            {sections.map((section) => (
              <div key={section.title} className="card detail-card">
                <h3>{section.title}</h3>

                <div className="detail-grid-stack">
                  {section.items.map(([label, value]) => (
                    <div key={label} className="detail-item">
                      <span>{label}</span>
                      <strong>{value || "—"}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Insurance Client Workflow</h3>

            <div className="timeline">
              {clientWorkflow.map((stage, index) => {
                const isComplete = index < currentWorkflowIndex;
                const isCurrent = index === currentWorkflowIndex;

                return (
                  <div
                    key={stage}
                    className={`timeline-step ${
                      isComplete ? "complete" : ""
                    } ${isCurrent ? "current" : ""}`}
                  >
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === "Timeline" && (
        <div className="card">
          <h3>Client Timeline</h3>

          <div className="timeline">
            {clientWorkflow.map((stage, index) => {
              const isComplete = index < currentWorkflowIndex;
              const isCurrent = index === currentWorkflowIndex;

              return (
                <div
                  key={stage}
                  className={`timeline-step ${
                    isComplete ? "complete" : ""
                  } ${isCurrent ? "current" : ""}`}
                >
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Activities" && (
        <div className="card">
          <h3>Activities</h3>

          <div className="activity-list">
            {lead.activity?.length ? (
              lead.activity.map((activity, index) => (
                <div
                  key={`${activity.text}-${index}`}
                  className="activity-item"
                >
                  <div
                    className="activity-dot"
                    style={{ background: "#2563eb" }}
                  />

                  <div>
                    <strong>{activity.text}</strong>
                    <p>Client activity recorded</p>
                  </div>

                  <span>{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                No activities recorded.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Documents" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Documents</h3>
              <p className="section-subtitle">
                Insurance and client onboarding documents.
              </p>
            </div>
          </div>

          <div className="attachment-grid">
            <div className="attachment-card">
              <span className="attachment-icon">📄</span>
              <strong>KYC Documents</strong>
            </div>

            <div className="attachment-card">
              <span className="attachment-icon">📄</span>
              <strong>Insurance Illustration</strong>
            </div>

            <div className="attachment-card">
              <span className="attachment-icon">📄</span>
              <strong>Proposal Form</strong>
            </div>

            <div className="attachment-card">
              <span className="attachment-icon">📄</span>
              <strong>Medical Documents</strong>
            </div>

            <div className="attachment-card">
              <span className="attachment-icon">📄</span>
              <strong>Policy Document</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Follow-ups" && (
        <div className="card">
          <h3>Follow-up Details</h3>

          <div className="detail-grid-stack">
            <div className="detail-item">
              <span>Next Follow-up Date</span>
              <strong>{lead.nextFollowUpDate || "Not scheduled"}</strong>
            </div>

            <div className="detail-item">
              <span>Follow-up Status</span>
              <strong>{lead.followUpStatus || "Pending"}</strong>
            </div>

            <div className="detail-item">
              <span>Assigned Advisor</span>
              <strong>
                {lead.advisorAssigned || lead.assignedTo || "—"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Client Response</span>
              <strong>{lead.leadResponse || "—"}</strong>
            </div>

            <div className="detail-item">
              <span>Notes</span>
              <strong>{lead.notes || "No notes available"}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Policy Details" && (
        <div className="card">
          <h3>Policy Details</h3>

          {lead.policyIssued ? (
            <div className="detail-grid-stack">
              <div className="detail-item">
                <span>Policy Status</span>
                <strong>Issued</strong>
              </div>

              <div className="detail-item">
                <span>Policy Type</span>
                <strong>{lead.policyTypeInterest || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Sum Assured</span>
                <strong>{lead.sumAssuredRequired || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Annual Premium Budget</span>
                <strong>{lead.annualPremiumBudget || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Advisor</span>
                <strong>
                  {lead.advisorName || lead.advisorAssigned || "—"}
                </strong>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Policy has not been issued for this client yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientDetailsPage;