import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

const tabs = [
  { label: "Clients", to: "/adviser/client-operations/clients" },
  { label: "Policies", to: "/adviser/client-operations/policies" },
  { label: "Claims", to: "/adviser/client-operations/claims" },
  { label: "Renewals", to: "/adviser/client-operations/renewals" },
  { label: "Services", to: "/adviser/client-operations/services" }
];

export default function ClientLayout() {
  const location = useLocation();
  const activeIndex = tabs.findIndex((tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2, background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>Client Operations</Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
            End-to-end client servicing, policy administration and renewals.
          </Typography>
        </Box>
        <Tabs value={activeIndex >= 0 ? activeIndex : 0} variant="scrollable" scrollButtons="auto" sx={{ px: 1, borderTop: "1px solid #e2e8f0", bgcolor: "#fff" }}>
          {tabs.map((tab) => (
            <Tab key={tab.to} label={tab.label} component={Link} to={tab.to} />
          ))}
        </Tabs>
      </Paper>
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
}
