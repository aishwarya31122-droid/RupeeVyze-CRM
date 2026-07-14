import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function BILayout() {
  return (
    <div className="module-layout">
      <div className="module-header">
        <h2>Business Intelligence</h2>
        <nav className="module-nav">
          <NavLink to="dashboard">Dashboard</NavLink>
          <NavLink to="reports">Reports</NavLink>
          <NavLink to="insights">Insights</NavLink>
        </nav>
      </div>
      <div className="module-content">
        <Outlet />
      </div>
    </div>
  );
}
