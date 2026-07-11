import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { initialClientLeads } from "../../data/clientCrmData";

const detailTabs = ["Overview", "Portfolio", "Transactions", "Documents", "Notes", "Reviews", "Referrals", "Proposals"];
const proposalStatusOptions = [
  "Draft",
  "Shared with Client",
  "Discussion",
  "Accepted",
  "Partially Accepted",
  "Rejected",
  "Investment Executed",
  "Archived"
];
const proposalPurposeOptions = [
  "Initial Investment",
  "Quarterly Review",
  "Annual Review",
  "Additional SIP",
  "Lumpsum Investment",
  "Portfolio Rebalancing",
  "Goal Planning",
  "Tax Planning",
  "Insurance Review",
  "Other"
];
const proposalDecisionOptions = ["Accepted", "Partially Accepted", "Rejected", "Pending"];
const proposalReasonOptions = [
  "Waiting for Bonus",
  "Salary Delayed",
  "Market Uncertainty",
  "Needs Family Approval",
  "Already Invested Elsewhere",
  "Other"
];
const investmentTypes = ["SIP", "Lumpsum"];
const attachmentOptions = ["Proposal PDF", "Excel Working", "Presentation", "Research Notes"];

const emptyRecommendation = () => ({ investmentName: "", investmentCategory: "", investmentType: "SIP", amount: "", frequency: "Monthly SIP", remarks: "" });

const emptyProposalForm = () => ({
  proposalId: "",
  proposalDate: new Date().toISOString().slice(0, 10),
  createdBy: "Riya Shah",
  versionNumber: 1,
  status: "Draft",
  purpose: "Initial Investment",
  recommendations: [emptyRecommendation()],
  clientDecision: "Pending",
  decisionReason: "",
  actualInvestment: [emptyRecommendation()],
  attachments: ["Proposal PDF"],
  internalNotes: ""
});

function ClientDetailsPage({ leads = initialClientLeads, onEditLead }) {
  const { id } = useParams();
  const lead = useMemo(() => leads.find((entry) => entry.id === id) || leads[0], [id, leads]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [proposals, setProposals] = useState(lead?.proposals ?? []);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [proposalForm, setProposalForm] = useState(emptyProposalForm());
  const [filters, setFilters] = useState({ search: "", status: "", purpose: "", version: "", createdBy: "", dateRange: "" });

  useEffect(() => {
    const nextProposals = lead?.proposals ?? [];
    setProposals(nextProposals);
    setSelectedProposalId((current) => {
      if (!nextProposals.length) return null;
      return current && nextProposals.some((item) => item.proposalId === current)
        ? current
        : nextProposals[0].proposalId;
    });
  }, [lead?.id, lead?.proposals]);

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

  const selectedProposal = proposals.find((item) => item.proposalId === selectedProposalId) || proposals[0] || null;

  const syncLeadProposals = (nextProposals) => {
    setProposals(nextProposals);
    if (onEditLead) {
      onEditLead({ ...lead, proposals: nextProposals });
    }
  };

  const handleProposalFormChange = (field, value) => {
    setProposalForm((current) => ({ ...current, [field]: value }));
  };

  const handleRecommendationChange = (index, field, value, collectionName) => {
    setProposalForm((current) => ({
      ...current,
      [collectionName]: current[collectionName].map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  };

  const addRecommendationRow = (collectionName) => {
    setProposalForm((current) => ({
      ...current,
      [collectionName]: [...current[collectionName], emptyRecommendation()]
    }));
  };

  const toggleAttachment = (attachment) => {
    setProposalForm((current) => {
      const nextAttachments = current.attachments.includes(attachment)
        ? current.attachments.filter((item) => item !== attachment)
        : [...current.attachments, attachment];
      return { ...current, attachments: nextAttachments };
    });
  };

  const handleSubmitProposal = (event) => {
    event.preventDefault();
    const normalizedRecommendations = proposalForm.recommendations.filter((item) => item.investmentName.trim() || item.amount);
    const normalizedActuals = proposalForm.actualInvestment.filter((item) => item.investmentName.trim() || item.amount);

    if (!normalizedRecommendations.length) {
      return;
    }

    const nextVersion = proposals.length ? Math.max(...proposals.map((item) => item.versionNumber)) + 1 : 1;
    const nextProposal = {
      proposalId: proposalForm.proposalId || `PROP-${String(proposals.length + 1).padStart(4, "0")}`,
      proposalDate: proposalForm.proposalDate,
      createdBy: proposalForm.createdBy || lead.advisorName || "Advisor",
      versionNumber: nextVersion,
      status: proposalForm.status,
      purpose: proposalForm.purpose,
      recommendations: normalizedRecommendations.map((item) => ({
        investmentName: item.investmentName,
        investmentCategory: item.investmentCategory,
        investmentType: item.investmentType,
        amount: item.amount,
        frequency: item.frequency,
        remarks: item.remarks
      })),
      clientDecision: proposalForm.clientDecision,
      decisionReason: proposalForm.clientDecision === "Accepted" ? "" : proposalForm.decisionReason,
      actualInvestment: normalizedActuals.map((item) => ({
        investmentName: item.investmentName,
        investmentCategory: item.investmentCategory,
        investmentType: item.investmentType,
        amount: item.amount,
        frequency: item.frequency,
        remarks: item.remarks
      })),
      attachments: proposalForm.attachments.filter(Boolean),
      internalNotes: proposalForm.internalNotes,
      timeline: [
        { event: "Proposal Created", date: proposalForm.proposalDate, time: "09:00", user: proposalForm.createdBy || lead.advisorName || "Advisor" },
        { event: "Shared with Client", date: proposalForm.proposalDate, time: "10:30", user: proposalForm.createdBy || lead.advisorName || "Advisor" }
      ]
    };

    const nextProposals = [nextProposal, ...proposals];
    syncLeadProposals(nextProposals);
    setSelectedProposalId(nextProposal.proposalId);
    setProposalForm(emptyProposalForm());
    setShowCreateModal(false);
    setActiveTab("Proposals");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return { background: "#166534" };
      case "Partially Accepted":
        return { background: "#d97706" };
      case "Rejected":
        return { background: "#dc2626" };
      case "Investment Executed":
        return { background: "#7c3aed" };
      case "Archived":
        return { background: "#475569" };
      case "Shared with Client":
        return { background: "#2563eb" };
      case "Discussion":
        return { background: "#0f766e" };
      default:
        return { background: "#64748b" };
    }
  };

  const getTimelineMeta = (eventName) => {
    const normalized = eventName?.toLowerCase() || "";

    if (normalized.includes("shared")) {
      return { icon: "↗", badgeLabel: "Shared", badgeColor: "#2563eb", description: "Proposal was shared with the client for review and discussion." };
    }

    if (normalized.includes("discussion")) {
      return { icon: "💬", badgeLabel: "Discussion", badgeColor: "#0f766e", description: "Advisor and client discussed the recommendations and next actions." };
    }

    if (normalized.includes("accepted")) {
      return { icon: "✓", badgeLabel: "Accepted", badgeColor: "#166534", description: "The client accepted the proposal and moved forward." };
    }

    if (normalized.includes("partially")) {
      return { icon: "◐", badgeLabel: "Partially Accepted", badgeColor: "#d97706", description: "The client accepted part of the proposal and requested changes." };
    }

    if (normalized.includes("rejected")) {
      return { icon: "✕", badgeLabel: "Rejected", badgeColor: "#dc2626", description: "The proposal was declined and closed for now." };
    }

    if (normalized.includes("investment")) {
      return { icon: "💰", badgeLabel: "Executed", badgeColor: "#7c3aed", description: "The approved recommendation was executed in the portfolio." };
    }

    if (normalized.includes("archive")) {
      return { icon: "🗂", badgeLabel: "Archived", badgeColor: "#475569", description: "The proposal was archived as a completed or inactive version." };
    }

    return { icon: "✦", badgeLabel: "Created", badgeColor: "#2563eb", description: "Proposal record created and logged for the client." };
  };

  const filteredProposals = useMemo(() => {
    return [...proposals].filter((proposal) => {
      const searchTerm = filters.search.trim().toLowerCase();
      const matchesSearch = !searchTerm || proposal.proposalId.toLowerCase().includes(searchTerm) || proposal.purpose.toLowerCase().includes(searchTerm);
      const matchesStatus = !filters.status || proposal.status === filters.status;
      const matchesPurpose = !filters.purpose || proposal.purpose === filters.purpose;
      const matchesVersion = !filters.version || String(proposal.versionNumber) === filters.version;
      const matchesCreator = !filters.createdBy || proposal.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase());
      const matchesDate = !filters.dateRange || proposal.proposalDate === filters.dateRange;
      return matchesSearch && matchesStatus && matchesPurpose && matchesVersion && matchesCreator && matchesDate;
    }).sort((first, second) => second.versionNumber - first.versionNumber);
  }, [filters, proposals]);

  const analyticsCards = [
    { label: "Total Proposals", value: proposals.length, tone: "#2563eb" },
    { label: "Draft Proposals", value: proposals.filter((proposal) => proposal.status === "Draft").length, tone: "#64748b" },
    { label: "Accepted", value: proposals.filter((proposal) => proposal.status === "Accepted" || proposal.clientDecision === "Accepted").length, tone: "#166534" },
    { label: "Rejected", value: proposals.filter((proposal) => proposal.status === "Rejected" || proposal.clientDecision === "Rejected").length, tone: "#dc2626" },
    { label: "Pending", value: proposals.filter((proposal) => proposal.clientDecision === "Pending" || proposal.status === "Discussion" || proposal.status === "Draft").length, tone: "#d97706" },
    { label: "Acceptance Rate", value: `${proposals.length ? Math.round((proposals.filter((proposal) => proposal.clientDecision === "Accepted" || proposal.status === "Accepted").length / proposals.length) * 100) : 0}%`, tone: "#0f766e" }
  ];

  const recommendedTotal = selectedProposal?.recommendations?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const actualTotal = selectedProposal?.actualInvestment?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;
  const acceptanceRate = recommendedTotal ? Math.round((actualTotal / recommendedTotal) * 100) : 0;
  const chartData = [
    { name: "Recommended", value: recommendedTotal },
    { name: "Actual", value: actualTotal }
  ];

  const versionHistoryProposals = [...proposals].sort((first, second) => second.versionNumber - first.versionNumber);
  const workflowStages = (() => {
    const stages = [
      { label: "Lead", key: "lead" },
      { label: "Client", key: "client" },
      { label: "Proposal", key: "proposal" },
      { label: "Investment", key: "investment" },
      { label: "Review", key: "review" },
      { label: "Referral", key: "referral" }
    ];

    const status = selectedProposal?.status || "Draft";
    let activeIndex = 2;

    if (status === "Investment Executed") {
      activeIndex = 3;
    } else if (["Accepted", "Partially Accepted", "Rejected", "Archived"].includes(status)) {
      activeIndex = 4;
    } else if (["Draft", "Shared with Client", "Discussion"].includes(status)) {
      activeIndex = 2;
    }

    return stages.map((stage, index) => {
      if (index < activeIndex) {
        return { ...stage, state: "complete" };
      }

      if (index === activeIndex) {
        return {
          ...stage,
          state: "active",
          label: status === "Archived" ? "Review Completed" : stage.label
        };
      }

      return { ...stage, state: "upcoming" };
    });
  })();
  const proposalTimelineEvents = [...(selectedProposal?.timeline || [])]
    .map((event) => ({ ...event, ...getTimelineMeta(event.event) }))
    .sort((first, second) => new Date(`${first.date}T${first.time}`) - new Date(`${second.date}T${second.time}`));

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

      <div className="tab-row">
        {detailTabs.map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? (
        <>
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
        </>
      ) : activeTab === "Proposals" ? (
        <div className="proposal-shell">
          <div className="proposal-workflow">
            {workflowStages.map((stage, index, list) => (
              <div key={`${stage.key}-${index}`} className={`workflow-chip ${stage.state}`}>
                <span className="workflow-icon">
                  {stage.state === "complete" ? "✓" : stage.state === "active" ? "●" : "○"}
                </span>
                <span>{stage.label}</span>
                {index < list.length - 1 ? <span className="workflow-arrow">↓</span> : null}
              </div>
            ))}
          </div>

          <div className="card-grid card-grid-2">
            {analyticsCards.map((item) => (
              <div key={item.label} className="card proposal-kpi-card" style={{ borderTop: `4px solid ${item.tone}` }}>
                <p className="section-subtitle">{item.label}</p>
                <h3>{item.value}</h3>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>Proposal Management</h3>
                <p className="section-subtitle">Track proposals, versions, and client decisions in one place.</p>
              </div>
              <button className="button primary" type="button" onClick={() => setShowCreateModal(true)}>+ Create Proposal</button>
            </div>

            <div className="filters-row proposal-filters">
              <input className="search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search proposal ID" />
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">All Statuses</option>
                {proposalStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={filters.purpose} onChange={(event) => setFilters((current) => ({ ...current, purpose: event.target.value }))}>
                <option value="">All Purposes</option>
                {proposalPurposeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={filters.version} onChange={(event) => setFilters((current) => ({ ...current, version: event.target.value }))}>
                <option value="">All Versions</option>
                {[...new Set(proposals.map((proposal) => proposal.versionNumber))].sort((first, second) => first - second).map((version) => <option key={version} value={version}>Version {version}</option>)}
              </select>
              <input value={filters.createdBy} onChange={(event) => setFilters((current) => ({ ...current, createdBy: event.target.value }))} placeholder="Created By" />
              <input type="date" value={filters.dateRange} onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value }))} />
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Proposal ID</th>
                    <th>Proposal Date</th>
                    <th>Purpose</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Client Decision</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map((proposal) => (
                    <tr key={proposal.proposalId} onClick={() => setSelectedProposalId(proposal.proposalId)} className={selectedProposal?.proposalId === proposal.proposalId ? "proposal-row active" : "proposal-row"}>
                      <td><strong>{proposal.proposalId}</strong></td>
                      <td>{proposal.proposalDate}</td>
                      <td>{proposal.purpose}</td>
                      <td>V{proposal.versionNumber}</td>
                      <td><span className="badge" style={getStatusStyle(proposal.status)}>{proposal.status}</span></td>
                      <td>{proposal.clientDecision}</td>
                      <td>{proposal.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>Proposal Detail</h3>
                <p className="section-subtitle">Full view of the current proposal, including recommendation and decision details.</p>
              </div>
            </div>

            {selectedProposal ? (
              <div className="proposal-detail-layout">
                <div className="card proposal-detail-panel">
                  <div className="proposal-summary">
                    <span className="badge" style={getStatusStyle(selectedProposal.status)}>{selectedProposal.status}</span>
                    <span className="badge secondary-btn">Version {selectedProposal.versionNumber}</span>
                    <span className="badge secondary-btn">Created by {selectedProposal.createdBy}</span>
                  </div>

                  <div className="detail-grid-stack">
                    <div className="detail-item"><span>Proposal ID</span><strong>{selectedProposal.proposalId}</strong></div>
                    <div className="detail-item"><span>Proposal Date</span><strong>{selectedProposal.proposalDate}</strong></div>
                    <div className="detail-item"><span>Purpose</span><strong>{selectedProposal.purpose}</strong></div>
                    <div className="detail-item"><span>Client Decision</span><strong>{selectedProposal.clientDecision}</strong></div>
                    {selectedProposal.decisionReason ? <div className="detail-item"><span>Reason</span><strong>{selectedProposal.decisionReason}</strong></div> : null}
                  </div>

                  <h4>Recommendations</h4>
                  <div className="proposal-comparison-grid">
                    {selectedProposal.recommendations.map((item, index) => {
                      const actualItem = selectedProposal.actualInvestment[index] || selectedProposal.actualInvestment[0] || {};
                      return (
                        <div key={`${selectedProposal.proposalId}-compare-${index}`} className="proposal-comparison-card">
                          <div>
                            <p className="section-subtitle">Recommended</p>
                            <strong>{item.investmentName || "—"}</strong>
                            <p>₹{Number(item.amount || 0).toLocaleString()} {item.investmentType || "SIP"}</p>
                          </div>
                          <div className="proposal-arrow">↓</div>
                          <div>
                            <p className="section-subtitle">Actual Investment</p>
                            <strong>{actualItem.investmentName || "—"}</strong>
                            <p>₹{Number(actualItem.amount || 0).toLocaleString()} {actualItem.investmentType || "SIP"}</p>
                          </div>
                          <div className="proposal-variance">Variance ₹{Math.abs(Number(item.amount || 0) - Number(actualItem.amount || 0)).toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>

                  <h4>Attachments</h4>
                  <div className="attachment-grid">
                    {selectedProposal.attachments?.length ? selectedProposal.attachments.map((attachment) => (
                      <div key={attachment} className="attachment-card">
                        <span className="attachment-icon">📄</span>
                        <strong>{attachment}</strong>
                      </div>
                    )) : <div className="empty-state">No attachments listed.</div>}
                  </div>

                  <h4>Internal Notes</h4>
                  <div className="empty-state">{selectedProposal.internalNotes || "No internal notes yet."}</div>

                  <h4>Recommendation vs Actual</h4>
                  <div className="chart-card">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Amount"]} />
                        <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="section-subtitle">Acceptance rate: {acceptanceRate}%</p>
                </div>

                <div className="card proposal-detail-panel">
                  <h4>Timeline</h4>
                  <div className="proposal-timeline">
                    {proposalTimelineEvents.map((event, index) => (
                      <div key={`${selectedProposal.proposalId}-${index}`} className="proposal-timeline-item">
                        <div className="proposal-timeline-marker">
                          <span className="proposal-timeline-icon">{event.icon}</span>
                        </div>
                        <div className="proposal-timeline-card">
                          <div className="proposal-timeline-header">
                            <div>
                              <strong>{event.event}</strong>
                              <p>{event.description}</p>
                            </div>
                            <span className="badge" style={{ background: event.badgeColor }}>{event.badgeLabel}</span>
                          </div>
                          <div className="proposal-timeline-meta">
                            <span>Date: {event.date}</span>
                            <span>Time: {event.time}</span>
                            <span>Performed By: {event.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h4>Version History</h4>
                  <div className="version-stack">
                    {versionHistoryProposals.map((proposal) => {
                      const isCurrentVersion = selectedProposal?.proposalId === proposal.proposalId;
                      return (
                        <div key={proposal.proposalId} className={`version-card ${isCurrentVersion ? "active" : ""}`}>
                          <div className="version-card-top">
                            <div>
                              <div className="version-card-title-row">
                                <strong>Version {proposal.versionNumber}</strong>
                                {isCurrentVersion ? <span className="badge" style={{ background: "#166534" }}>Current Version</span> : null}
                              </div>
                              <p className="version-card-name">{proposal.versionName || proposal.purpose}</p>
                            </div>
                            <span className="badge secondary-btn">{proposal.status}</span>
                          </div>

                          <div className="version-card-meta">
                            <div>
                              <span className="section-subtitle">Created Date</span>
                              <strong>{proposal.proposalDate}</strong>
                            </div>
                            <div>
                              <span className="section-subtitle">Created By</span>
                              <strong>{proposal.createdBy}</strong>
                            </div>
                          </div>

                          <div className="version-card-summary">
                            <span className="section-subtitle">Changes</span>
                            <p>{proposal.shortSummary || `Updated ${proposal.purpose.toLowerCase()} scope and refreshed the proposal outcome.`}</p>
                          </div>

                          <div className="version-card-footer">
                            <span className="section-subtitle">Proposal ID {proposal.proposalId}</span>
                            <button type="button" className="button secondary" onClick={() => setSelectedProposalId(proposal.proposalId)}>View Version</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">Select a proposal to review its details.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>{activeTab}</h3>
          <p className="section-subtitle">This client profile section remains part of the existing prototype experience and is kept intact with the current CRM styling.</p>
        </div>
      )}

      {showCreateModal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content proposal-modal">
            <div className="modal-header">
              <div>
                <h3>Create Proposal</h3>
                <p className="section-subtitle">Create a new proposal version without overwriting the previous one.</p>
              </div>
              <button type="button" className="button secondary" onClick={() => setShowCreateModal(false)}>Close</button>
            </div>

            <form className="proposal-form-section" onSubmit={handleSubmitProposal}>
              <div className="proposal-field-grid">
                <label className="field">
                  <span>Proposal ID</span>
                  <input value={proposalForm.proposalId || "Auto-generated on save"} disabled />
                </label>
                <label className="field">
                  <span>Proposal Date</span>
                  <input type="date" value={proposalForm.proposalDate} onChange={(event) => handleProposalFormChange("proposalDate", event.target.value)} />
                </label>
                <label className="field">
                  <span>Created By</span>
                  <input value={proposalForm.createdBy} onChange={(event) => handleProposalFormChange("createdBy", event.target.value)} />
                </label>
                <label className="field">
                  <span>Version Number</span>
                  <input value={proposals.length ? Math.max(...proposals.map((item) => item.versionNumber)) + 1 : 1} disabled />
                </label>
                <label className="field">
                  <span>Status</span>
                  <select value={proposalForm.status} onChange={(event) => handleProposalFormChange("status", event.target.value)}>
                    {proposalStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Purpose</span>
                  <select value={proposalForm.purpose} onChange={(event) => handleProposalFormChange("purpose", event.target.value)}>
                    {proposalPurposeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Client Decision</span>
                  <select value={proposalForm.clientDecision} onChange={(event) => handleProposalFormChange("clientDecision", event.target.value)}>
                    {proposalDecisionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>

              {proposalForm.clientDecision !== "Accepted" ? (
                <label className="field">
                  <span>Reason</span>
                  <select value={proposalForm.decisionReason} onChange={(event) => handleProposalFormChange("decisionReason", event.target.value)}>
                    <option value="">Select a reason</option>
                    {proposalReasonOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ) : null}

              <div className="card" style={{ padding: 16 }}>
                <div className="card-header">
                  <h4>Investment Recommendations</h4>
                  <button type="button" className="button secondary" onClick={() => addRecommendationRow("recommendations")}>+ Add Recommendation</button>
                </div>
                {proposalForm.recommendations.map((recommendation, index) => (
                  <div key={`${index}-recommendation`} className="recommendation-row">
                    <label className="field">
                      <span>Investment Name</span>
                      <input value={recommendation.investmentName} onChange={(event) => handleRecommendationChange(index, "investmentName", event.target.value, "recommendations")} placeholder="Parag Parikh Flexi Cap Fund" />
                    </label>
                    <label className="field">
                      <span>Investment Category</span>
                      <input value={recommendation.investmentCategory} onChange={(event) => handleRecommendationChange(index, "investmentCategory", event.target.value, "recommendations")} placeholder="Equity" />
                    </label>
                    <label className="field">
                      <span>Investment Type</span>
                      <select value={recommendation.investmentType} onChange={(event) => handleRecommendationChange(index, "investmentType", event.target.value, "recommendations")}>
                        {investmentTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Amount</span>
                      <input type="number" value={recommendation.amount} onChange={(event) => handleRecommendationChange(index, "amount", event.target.value, "recommendations")} placeholder="10000" />
                    </label>
                    <label className="field">
                      <span>Frequency</span>
                      <input value={recommendation.frequency} onChange={(event) => handleRecommendationChange(index, "frequency", event.target.value, "recommendations")} placeholder="Monthly SIP" />
                    </label>
                    <label className="field">
                      <span>Remarks</span>
                      <input value={recommendation.remarks} onChange={(event) => handleRecommendationChange(index, "remarks", event.target.value, "recommendations")} placeholder="Long-term growth focus" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div className="card-header">
                  <h4>Actual Investment</h4>
                  <button type="button" className="button secondary" onClick={() => addRecommendationRow("actualInvestment")}>+ Add Recommendation</button>
                </div>
                {proposalForm.actualInvestment.map((recommendation, index) => (
                  <div key={`${index}-actual`} className="recommendation-row">
                    <label className="field">
                      <span>Investment Name</span>
                      <input value={recommendation.investmentName} onChange={(event) => handleRecommendationChange(index, "investmentName", event.target.value, "actualInvestment")} />
                    </label>
                    <label className="field">
                      <span>Investment Category</span>
                      <input value={recommendation.investmentCategory} onChange={(event) => handleRecommendationChange(index, "investmentCategory", event.target.value, "actualInvestment")} placeholder="Equity" />
                    </label>
                    <label className="field">
                      <span>Investment Type</span>
                      <select value={recommendation.investmentType} onChange={(event) => handleRecommendationChange(index, "investmentType", event.target.value, "actualInvestment")}>
                        {investmentTypes.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Amount</span>
                      <input type="number" value={recommendation.amount} onChange={(event) => handleRecommendationChange(index, "amount", event.target.value, "actualInvestment")} />
                    </label>
                    <label className="field">
                      <span>Frequency</span>
                      <input value={recommendation.frequency} onChange={(event) => handleRecommendationChange(index, "frequency", event.target.value, "actualInvestment")} />
                    </label>
                    <label className="field">
                      <span>Remarks</span>
                      <input value={recommendation.remarks} onChange={(event) => handleRecommendationChange(index, "remarks", event.target.value, "actualInvestment")} />
                    </label>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 16 }}>
                <h4>Attachments</h4>
                <div className="attachment-grid">
                  {attachmentOptions.map((attachment) => (
                    <button key={attachment} type="button" className={`attachment-card ${proposalForm.attachments.includes(attachment) ? "selected" : ""}`} onClick={() => toggleAttachment(attachment)}>
                      <span className="attachment-icon">📄</span>
                      <strong>{attachment}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <label className="field">
                <span>Internal Notes</span>
                <textarea value={proposalForm.internalNotes} onChange={(event) => handleProposalFormChange("internalNotes", event.target.value)} placeholder="Advisor-only remarks. Example: Client wants to increase SIP after annual bonus." />
              </label>

              <div className="modal-actions">
                <button type="submit" className="button primary">Save Proposal</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ClientDetailsPage;
