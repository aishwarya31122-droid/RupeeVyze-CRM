import { useMemo } from "react";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

function LeadLayout({ children, leads = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentLeadId = location.pathname.match(/^\/adviser\/lead-management\/lead\/([^/]+)/)?.[1];
  const profilePath = currentLeadId
    ? `/adviser/lead-management/lead/${currentLeadId}`
    : leads[0]
      ? `/adviser/lead-management/lead/${leads[0].id}`
      : "/adviser/lead-management/dashboard";

  const tabs = useMemo(
    () => [
      { label: "Lead Dashboard", to: "/adviser/lead-management/dashboard" },
      { label: "Pipeline", to: "/adviser/lead-management/pipeline" },
      { label: "360 Lead Profile", to: profilePath },
      { label: "Tasks & Follow-ups", to: "/adviser/lead-management/tasks" },
      { label: "All Leads", to: "/adviser/lead-management/all" }
    ],
    [profilePath]
  );

  const activeIndex = tabs.findIndex((tab) =>
    tab.to.startsWith("/adviser/lead-management/lead/")
      ? location.pathname.startsWith("/adviser/lead-management/lead/") && tab.label === "360 Lead Profile"
      : location.pathname === tab.to
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Lead Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
            Manage leads, pipeline stages, follow-ups, and conversions.
          </Typography>
        </Box>
        <Tabs
          value={activeIndex >= 0 ? activeIndex : 0}
          onChange={(_, value) => navigate(tabs[value].to)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, borderTop: "1px solid #e2e8f0", bgcolor: "#fff" }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.to} label={tab.label} />
          ))}
        </Tabs>
      </Paper>
      <Box>{children}</Box>
    </Box>
  );
}

export default LeadLayout;
