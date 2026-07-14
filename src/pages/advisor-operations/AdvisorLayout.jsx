import { Link, useLocation } from "react-router-dom";

function AdvisorLayout({ children }) {
  const location = useLocation();
  const nav = [
    { label: "Recruitment", to: "/adviser/advisor-operations/recruitment" },
    { label: "Active Advisors", to: "/adviser/advisor-operations/active" },
    { label: "Performance", to: "/adviser/advisor-operations/performance" },
    { label: "Overrides", to: "/adviser/advisor-operations/overrides" },
    { label: "Payouts", to: "/adviser/advisor-operations/payouts" },
    { label: "Business", to: "/adviser/advisor-operations/business" }
  ];

  return (
    <div>
      <div className="page-header">
        <nav>
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}>{item.label}</Link>
          ))}
        </nav>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

export default AdvisorLayout;
