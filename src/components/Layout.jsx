import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/adviser/dashboard" },
  { label: "Lead Management", to: "/adviser/lead-management" },
  { label: "Advisor Operations", to: "/adviser/advisor-operations" },
  { label: "Client Operations", to: "/adviser/client-operations" },
  { label: "Business Intelligence", to: "/adviser/business-intelligence" },
  { label: "Administration", to: "/adviser/administration" }
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { candidates, clients } = useCrm();
  const [search, setSearch] = useState("");

  const notifications = useMemo(() => {
    const alertItems = [];
    candidates.forEach((candidate) => {
      if (candidate.nextFollowUp || candidate.followUpDate) {
        const due = new Date(candidate.nextFollowUp || candidate.followUpDate);
        const today = new Date();
        const sameDay = due.toDateString() === today.toDateString();
        if (sameDay) alertItems.push({ id: candidate.id, message: `Follow-up Due Today • ${candidate.name}` });
      }
      if (candidate.workflowStage === "Training") alertItems.push({ id: `${candidate.id}-training`, message: `Training Pending • ${candidate.name}` });
      if (candidate.workflowStage === "Exam") alertItems.push({ id: `${candidate.id}-exam`, message: `Exam Scheduled Today • ${candidate.name}` });
      if (candidate.documents?.length === 0) alertItems.push({ id: `${candidate.id}-docs`, message: `Documents Pending • ${candidate.name}` });
    });
    return alertItems.slice(0, 5);
  }, [candidates]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (value.trim().length > 2) {
      const q = value.toLowerCase();

      const candidateMatch = candidates.find((candidate) => {
        const fields = [
          String(candidate.id),
          candidate.leadId,
          candidate.name,
          candidate.mobile,
          candidate.phone,
          candidate.email,
          candidate.city,
          candidate.assignedTo,
          candidate.leadSource,
          candidate.advisorCode,
        ];
        return fields.some((field) => field?.toLowerCase().includes(q));
      });

      if (candidateMatch) {
        navigate(`/adviser/lead-management/lead/${candidateMatch.id}`);
        return;
      }

      const clientMatch = (clients || []).find((client) => {
        const fields = [
          String(client.id),
          client.clientId,
          client.name,
          client.mobile,
          client.city,
          client.advisorAssigned,
          client.policyNumber,
          client.advisorName,
        ];
        return fields.some((field) => field?.toLowerCase().includes(q));
      });

      if (clientMatch) {
        navigate(`/adviser/client-operations/clients/${clientMatch.clientId || clientMatch.id}`);
        return;
      }

      const policyMatch = (clients || []).flatMap((client) => (client.policies || []).map((policy) => ({ ...policy, clientName: client.name, advisor: client.advisorAssigned })) ).find((policy) => {
        const fields = [policy.policyNumber, policy.clientName, policy.advisor, policy.policyType];
        return fields.some((field) => field?.toLowerCase().includes(q));
      });

      if (policyMatch) {
        navigate(`/adviser/client-operations/policies`);
      }
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <h2>RupeeVyze Insurance CRM</h2>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname.startsWith(item.to) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content">
        <div className="topbar">
          <input className="topbar-search" type="text" value={search} onChange={handleSearch} placeholder="Search Lead/Advisor/Client ID, Name, Mobile, Advisor Code" />
          <div className="topbar-actions">
            <div className="notification-chip">🔔 {notifications.length}</div>
            <div className="topbar-user">Recruiter Workspace</div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default Layout;