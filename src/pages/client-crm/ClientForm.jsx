import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { initialClientLeads } from "../../data/clientCrmData";

const defaultLead = {
  id: "",
  name: "",
  mobile: "",
  city: "",
  leadSource: "Website",
  dateReceived: "",
  assignedTo: "Riya Shah",
  leadQuality: "Hot",
  interestLevel: "High",
  firstCallAttempt: "",
  callStatus: "Connected",
  leadResponse: "Interested",
  policyTypeInterest: "Term Insurance",
  sumAssuredRequired: "",
  annualPremiumBudget: "",
  proposalSent: false,
  nextFollowUpDate: "",
  followUpStatus: "Pending",
  kycStarted: false,
  policyIssued: false,
  conversionStage: "Lead Received",
  finalStatus: "Follow-up Pending",
  clientId: "",
  lostDropReason: "",
  advisorAssigned: "Riya Shah",
  notes: "",
  leaderName: "Sanjay Rao",
  advisorName: "Riya Shah",
  tataAiaCode: ""
};

function ClientForm({ leads = initialClientLeads, onSubmit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const existingLead = useMemo(() => leads.find((entry) => entry.id === id), [id, leads]);
  const [lead, setLead] = useState(existingLead || defaultLead);
  const [openSection, setOpenSection] = useState(1);

  const sections = [
    { id: 1, title: "Lead Information", fields: [
      { label: "Lead ID", key: "id", type: "text", readOnly: true },
      { label: "Full Name", key: "name", type: "text" },
      { label: "Mobile", key: "mobile", type: "text" },
      { label: "City", key: "city", type: "text" }
    ]},
    { id: 2, title: "Qualification", fields: [
      { label: "Lead Source", key: "leadSource", type: "select", options: ["Website", "Referral", "Social Media", "Partner Channel", "Call Center"] },
      { label: "Date Received", key: "dateReceived", type: "date" },
      { label: "Assigned To", key: "assignedTo", type: "text" },
      { label: "Lead Quality", key: "leadQuality", type: "select", options: ["Hot", "Warm", "Cold"] },
      { label: "Interest Level", key: "interestLevel", type: "select", options: ["High", "Medium", "Low"] }
    ]},
    { id: 3, title: "Call Tracking", fields: [
      { label: "First Call Attempt", key: "firstCallAttempt", type: "date" },
      { label: "Call Status", key: "callStatus", type: "select", options: ["Connected", "Callback", "No Answer", "Not Interested"] },
      { label: "Lead Response", key: "leadResponse", type: "text" }
    ]},
    { id: 4, title: "Needs Analysis", fields: [
      { label: "Policy Type Interest", key: "policyTypeInterest", type: "text" },
      { label: "Sum Assured Required", key: "sumAssuredRequired", type: "text" },
      { label: "Annual Premium Budget", key: "annualPremiumBudget", type: "text" }
    ]},
    { id: 5, title: "Progression", fields: [
      { label: "Proposal Sent", key: "proposalSent", type: "checkbox" },
      { label: "Next Follow-up Date", key: "nextFollowUpDate", type: "date" }
    ]},
    { id: 6, title: "Onboarding", fields: [
      { label: "KYC Started", key: "kycStarted", type: "checkbox" },
      { label: "Policy Issued", key: "policyIssued", type: "checkbox" }
    ]},
    { id: 7, title: "Outcome", fields: [
      { label: "Conversion Stage", key: "conversionStage", type: "text" },
      { label: "Final Status", key: "finalStatus", type: "text" },
      { label: "Client ID", key: "clientId", type: "text" },
      { label: "Lost / Drop Reason", key: "lostDropReason", type: "text" }
    ]},
    { id: 8, title: "Admin", fields: [
      { label: "Advisor Assigned", key: "advisorAssigned", type: "text" },
      { label: "Notes / Objections", key: "notes", type: "textarea" }
    ]},
    { id: 9, title: "Hierarchy", fields: [
      { label: "Leader Name", key: "leaderName", type: "text" },
      { label: "Advisor Name", key: "advisorName", type: "text" },
      { label: "TATA AIA Code", key: "tataAiaCode", type: "text" }
    ]}
  ];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLead((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(lead);
    navigate("/client-crm/pipeline");
  };

  return (
    <div className="client-form-page">
      <div className="page-header">
        <div>
          <h1>{id ? "Edit Client" : "Add Client"}</h1>
          <p>Capture complete client information with collapsible sections for faster updates.</p>
        </div>
      </div>

      <form className="card client-form" onSubmit={handleSubmit}>
        {sections.map((section) => (
          <div key={section.id} className="form-section">
            <button type="button" className="section-toggle" onClick={() => setOpenSection(openSection === section.id ? 0 : section.id)}>
              <span>{section.title}</span>
              <span>{openSection === section.id ? "−" : "+"}</span>
            </button>
            {openSection === section.id && (
              <div className="section-body">
                {section.fields.map((field) => (
                  <label key={field.key} className="field">
                    <span>{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea name={field.key} value={lead[field.key] || ""} onChange={handleChange} />
                    ) : field.type === "select" ? (
                      <select name={field.key} value={lead[field.key] || ""} onChange={handleChange}>
                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <input type="checkbox" name={field.key} checked={Boolean(lead[field.key])} onChange={handleChange} />
                    ) : (
                      <input type={field.type} name={field.key} value={lead[field.key] || ""} onChange={handleChange} readOnly={field.readOnly} />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="modal-actions">
          <button type="submit" className="button primary">Save Client</button>
        </div>
      </form>
    </div>
  );
}

export default ClientForm;
