import { useMemo } from "react";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

function AdvisorLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const nav = useMemo(
    () => [
      { label: "Recruitment", to: "/adviser/advisor-operations/recruitment" },
      { label: "Advisor Recruitment", to: "/adviser/advisor-operations/active" },
      { label: "Performance", to: "/adviser/advisor-operations/performance" },
      { label: "Override & Payout", to: "/adviser/advisor-operations/override-payouts" },
      { label: "Business", to: "/adviser/advisor-operations/business" }
    ],
    []
  );

  const activeTab = nav.findIndex((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Advisor Operations
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
            Dedicated workspace for recruitment, advisor performance and business growth.
          </Typography>
        </Box>
        <Tabs
          value={activeTab >= 0 ? activeTab : 0}
          onChange={(_, value) => navigate(nav[value].to)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1, borderTop: "1px solid #e2e8f0", bgcolor: "#fff" }}
        >
          {nav.map((item) => (
            <Tab key={item.to} label={item.label} />
          ))}
        </Tabs>
      </Paper>
      <Box>{children}</Box>
    </Box>
  );
}

export default AdvisorLayout;
