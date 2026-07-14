import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { initialClientLeads } from "../../data/clientCrmData";

const navItems = [
  { label: "Dashboard", to: "/client-crm/dashboard" },
  { label: "Client Pipeline", to: "/client-crm/pipeline" },
  { label: "Client Details", to: "/client-crm/details" },
  { label: "Follow-up Tracker", to: "/client-crm/followups" },
  { label: "Reports & Analytics", to: "/client-crm/reports" }
];

function ClientCRMLayout({ children, leads = initialClientLeads }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const notifications = useMemo(() => {
    return leads.filter((lead) => lead.followUpStatus === "Overdue" || lead.followUpStatus === "Pending").slice(0, 4);
  }, [leads]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (value.trim().length > 2) {
      const q = value.toLowerCase();

      const match = leads.find((lead) => {
        const fields = [
          String(lead.id),
          lead.clientId,
          lead.name,
          lead.mobile,
          lead.city,
          lead.advisorAssigned,
          lead.policyNumber,
        ];
        return fields.some((field) => field?.toLowerCase().includes(q));
      });

      if (match) {
        navigate(`/client-crm/client/${match.id}`);
      }
    }
  };

  return (
    <div className="app client-crm-app">
      <aside className="sidebar client-sidebar">
        <div>
          <h2>RupeeVyze Client CRM</h2>
          <p className="sidebar-subtitle">Internal insurance operations</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content client-content">
        <div className="topbar">
          <input className="topbar-search" type="text" value={search} onChange={handleSearch} placeholder="Search Lead ID, Client ID, Advisor ID, Name, Mobile, Policy Number, Advisor Code" />
          <div className="topbar-actions">
            <div className="notification-chip">🔔 {notifications.length}</div>
            <div className="topbar-user">Internal Team Workspace</div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default ClientCRMLayout;
