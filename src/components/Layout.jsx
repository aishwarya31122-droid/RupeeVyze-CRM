import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";

const navItems = [
  { label: "Dashboard", to: "/adviser/dashboard" },
  { label: "Recruitment Pipeline", to: "/adviser/pipeline" },
  { label: "Follow-up Tracker", to: "/adviser/followups" },
  { label: "Reports & Analytics", to: "/adviser/reports" },
  { label: "Team Members", to: "/adviser/team" },
  { label: "Performance Tracker", to: "/adviser/performance" },
  { label: "Override & Payout Tracker", to: "/adviser/override-payout" },
  { label: "Details", to: "/adviser/details" }
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { candidates } = useCrm();
  const [search, setSearch] = useState("");

  const notifications = useMemo(() => {
    const alertItems = [];
    candidates.forEach((candidate) => {
      if (candidate.followUpDate) {
        const due = new Date(candidate.followUpDate);
        const today = new Date();
        const sameDay = due.toDateString() === today.toDateString();
        if (sameDay) alertItems.push({ id: candidate.id, message: `Follow-up Due Today • ${candidate.name}` });
      }
      if (candidate.trainingStatus === "Pending") alertItems.push({ id: `${candidate.id}-training`, message: `Training Pending • ${candidate.name}` });
      if (candidate.examResult === "Pending") alertItems.push({ id: `${candidate.id}-exam`, message: `Exam Scheduled Today • ${candidate.name}` });
      if (candidate.stage === "Documents Submitted") alertItems.push({ id: `${candidate.id}-docs`, message: `Documents Pending • ${candidate.name}` });
    });
    return alertItems.slice(0, 5);
  }, [candidates]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (value.trim().length > 2) {
      const q = value.toLowerCase();

      const match = candidates.find((candidate) => {
        const fields = [
          String(candidate.id),
          candidate.name,
          candidate.phone,
          candidate.email,
          candidate.city,
          candidate.advisorCode,
        ];
        return fields.some((field) => field?.toLowerCase().includes(q));
      });

      if (match) navigate(`/adviser/candidate/${match.id}`);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <h2>RupeeVyze Adviser Recruitment CRM</h2>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content">
        <div className="topbar">
          <input className="topbar-search" type="text" value={search} onChange={handleSearch} placeholder="Search Lead/Advisor ID, Name, Mobile, Advisor Code" />
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