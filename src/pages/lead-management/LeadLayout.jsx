import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function LeadLayout({ children, leads = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length > 2) {
      const match = leads.find((lead) => [lead.leadId, lead.name, lead.phone, lead.email, lead.policyNumber].some((f) => f?.toLowerCase().includes(q.toLowerCase())));
      if (match) navigate(`/adviser/lead-management/lead/${match.id}`);
    }
  };

  const nav = [
    { label: "Lead Dashboard", to: "/adviser/lead-management/dashboard" },
    { label: "Pipeline", to: "/adviser/lead-management/pipeline" },
    { label: "All Leads", to: "/adviser/lead-management/all" }
  ];

  return (
    <div className="client-crm-app">
      <div className="topbar">
        <input className="topbar-search" value={search} onChange={handleSearch} placeholder="Search Lead ID, Name, Mobile, Policy" />
        <div style={{ marginLeft: "auto" }} />
      </div>

      <div className="page-header">
        <nav>
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

export default LeadLayout;
