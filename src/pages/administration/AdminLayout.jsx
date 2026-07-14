import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="module-layout">
      <div className="module-header">
        <h2>Administration</h2>
        <nav className="module-nav">
          <NavLink to="users">Users</NavLink>
          <NavLink to="roles">Roles</NavLink>
          <NavLink to="permissions">Permissions</NavLink>
          <NavLink to="settings">Settings</NavLink>
        </nav>
      </div>
      <div className="module-content">
        <Outlet />
      </div>
    </div>
  );
}
