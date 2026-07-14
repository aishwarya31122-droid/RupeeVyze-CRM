import React from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function ClientLayout() {
  return (
    <div className="module-layout">
      <div className="module-header">
        <h2>Client Operations</h2>
        <nav className="module-nav">
          <NavLink to="clients">Clients</NavLink>
          <NavLink to="policies">Policies</NavLink>
          <NavLink to="claims">Claims</NavLink>
          <NavLink to="renewals">Renewals</NavLink>
        </nav>
      </div>
      <div className="module-content">
        <Outlet />
      </div>
    </div>
  );
}
