import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./ClientLayout";
import ClientsList from "./ClientsList";
import ClientDetails from "./ClientDetails";
import Policies from "./Policies";
import Claims from "./Claims";
import Renewals from "./Renewals";
import Services from "./Services";

export default function ClientOperationsModule() {
  return (
    <Routes>
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<ClientsList />} />
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/:id" element={<ClientDetails />} />
        <Route path="policies" element={<Policies />} />
        <Route path="claims" element={<Claims />} />
        <Route path="renewals" element={<Renewals />} />
        <Route path="services" element={<Services />} />
      </Route>
      <Route path="*" element={<Navigate to="/adviser/client-operations/clients" replace />} />
    </Routes>
  );
}
