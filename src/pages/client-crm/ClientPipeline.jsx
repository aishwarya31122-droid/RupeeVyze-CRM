import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { initialClientLeads } from "../../data/clientCrmData";

function ClientPipeline({ leads = initialClientLeads, onAddLead }) {
  const [search, setSearch] = useState("");
  const [leadSource, setLeadSource] = useState("All");
  const [leadQuality, setLeadQuality] = useState("All");
  const [advisor, setAdvisor] = useState("All");
  const [city, setCity] = useState("All");
  const [stage, setStage] = useState("All");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = search.toLowerCase();
      const matchesSearch = !query || [lead.id, lead.name, lead.mobile, lead.city, lead.advisorAssigned].some((field) => field?.toLowerCase().includes(query));
      const matchesSource = leadSource === "All" || lead.leadSource === leadSource;
      const matchesQuality = leadQuality === "All" || lead.leadQuality === leadQuality;
      const matchesAdvisor = advisor === "All" || lead.advisorAssigned === advisor;
      const matchesCity = city === "All" || lead.city === city;
      const matchesStage = stage === "All" || lead.conversionStage === stage;
      return matchesSearch && matchesSource && matchesQuality && matchesAdvisor && matchesCity && matchesStage;
    });
  }, [leads, search, leadSource, leadQuality, advisor, city, stage]);

  const exportCsv = () => {
    const rows = filteredLeads.map((lead) => [lead.id, lead.name, lead.mobile, lead.city, lead.advisorAssigned, lead.leadQuality, lead.policyTypeInterest, lead.conversionStage, lead.nextFollowUpDate, lead.finalStatus].join(","));
    const csv = ["Lead ID,Client Name,Mobile,City,Advisor Assigned,Lead Quality,Policy Type,Current Stage,Next Follow-up Date,Final Status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "client-pipeline.csv";
    link.click();
  };

  return (
    <div className="client-pipeline">
      <div className="page-header">
        <div>
          <h1>Client Pipeline</h1>
          <p>Search, filter, and manage every insurance lead from one place.</p>
        </div>
        <div className="header-summary">
          <button className="button secondary" onClick={exportCsv}>Export CSV</button>
          <Link className="button primary" to="/client-crm/add">+ Add Lead</Link>
        </div>
      </div>

      <div className="card">
        <div className="filters-row">
          <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Client" />
          <select value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
            <option value="All">Filter by Lead Source</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Partner Channel">Partner Channel</option>
            <option value="Call Center">Call Center</option>
          </select>
          <select value={leadQuality} onChange={(e) => setLeadQuality(e.target.value)}>
            <option value="All">Filter by Lead Quality</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <select value={advisor} onChange={(e) => setAdvisor(e.target.value)}>
            <option value="All">Filter by Advisor</option>
            <option value="Riya Shah">Riya Shah</option>
            <option value="Aman Verma">Aman Verma</option>
            <option value="Neha Joshi">Neha Joshi</option>
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="All">Filter by City</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Pune">Pune</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="All">Filter by Stage</option>
            <option value="Lead Received">Lead Received</option>
            <option value="Qualified">Qualified</option>
            <option value="First Call">First Call</option>
            <option value="Needs Analysis">Needs Analysis</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="KYC Started">KYC Started</option>
            <option value="Policy Issued">Policy Issued</option>
            <option value="Converted">Converted</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Client Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Advisor Assigned</th>
                <th>Lead Quality</th>
                <th>Policy Type</th>
                <th>Current Stage</th>
                <th>Next Follow-up Date</th>
                <th>Final Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id}</td>
                  <td>{lead.name}</td>
                  <td>{lead.mobile}</td>
                  <td>{lead.city}</td>
                  <td>{lead.advisorAssigned}</td>
                  <td><span className="badge" style={{ background: lead.leadQuality === "Hot" ? "#dc2626" : lead.leadQuality === "Warm" ? "#f59e0b" : "#2563eb" }}>{lead.leadQuality}</span></td>
                  <td>{lead.policyTypeInterest}</td>
                  <td>{lead.conversionStage}</td>
                  <td>{lead.nextFollowUpDate}</td>
                  <td><span className="badge" style={{ background: lead.finalStatus === "Converted" ? "#166534" : lead.finalStatus === "Lost" ? "#dc2626" : lead.finalStatus === "Proposal Sent" ? "#7c3aed" : "#64748b" }}>{lead.finalStatus}</span></td>
                  <td>
                    <Link className="button secondary" to={`/client-crm/client/${lead.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientPipeline;
