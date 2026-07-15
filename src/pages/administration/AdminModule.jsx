import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Users from "./Users";
import Roles from "./Roles";
import Permissions from "./Permissions";
import AdminSettings from "./AdminSettings";

export default function AdminModule() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Users />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/adviser/administration/users" replace />} />
    </Routes>
  );
}
