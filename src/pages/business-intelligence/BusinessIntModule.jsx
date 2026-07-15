import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BILayout from "./BILayout";
import BIDashboard from "./BIDashboard";
import Reports from "../Reports.jsx";
import Insights from "./Insights";

export default function BusinessIntModule() {
  return (
    <Routes>
      <Route path="/" element={<BILayout />}>
        <Route index element={<BIDashboard />} />
        <Route path="dashboard" element={<BIDashboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="insights" element={<Insights />} />
      </Route>
      <Route path="*" element={<Navigate to="/adviser/business-intelligence/dashboard" replace />} />
    </Routes>
  );
}
