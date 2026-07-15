import { Link, useLocation } from "react-router-dom";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

function LeadLayout({ children, leads = [] }) {
  const location = useLocation();
  const currentLeadId = location.pathname.match(/^\/adviser\/lead-management\/lead\/([^/]+)/)?.[1];
  const profilePath = currentLeadId
    ? `/adviser/lead-management/lead/${currentLeadId}`
    : leads[0]
      ? `/adviser/lead-management/lead/${leads[0].id}`
      : "/adviser/lead-management/dashboard";

  const tabs = [
    { label: "Lead Dashboard", to: "/adviser/lead-management/dashboard" },
    { label: "Pipeline", to: "/adviser/lead-management/pipeline" },
    { label: "360 Lead Profile", to: profilePath },
    { label: "Tasks & Follow-ups", to: "/adviser/lead-management/tasks" },
    { label: "All Leads", to: "/adviser/lead-management/all" }
  ];

  const activeIndex = tabs.findIndex((tab) =>
    tab.to.startsWith("/adviser/lead-management/lead/")
      ? location.pathname.startsWith("/adviser/lead-management/lead/") && tab.label === "360 Lead Profile"
      : location.pathname === tab.to
  );

  return (
    <div className="lead-management-layout">
      <div className="page-header tabs-header">
        <Tabs value={activeIndex === -1 ? false : activeIndex} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
          {tabs.map((tab) => (
            <Tab key={tab.to} label={tab.label} component={Link} to={tab.to} />
          ))}
        </Tabs>
      </div>
      <div className="lead-management-content">{children}</div>
    </div>
  );
}

export default LeadLayout;
