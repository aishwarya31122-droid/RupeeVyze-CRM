import React from "react";
import { useNavigate } from "react-router-dom";
import { initialClientLeads as clientData } from "../../data/clientCrmData";

export default function ClientsList() {
  const navigate = useNavigate();
  const clients = clientData || [];

  return (
    <div>
      <h3>All Clients</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Client ID</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>City</th>
            <th>Advisor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.clientId} onClick={() => navigate(`clients/${c.clientId}`)} style={{ cursor: "pointer" }}>
              <td>{c.clientId}</td>
              <td>{c.name}</td>
              <td>{c.mobile}</td>
              <td>{c.city}</td>
              <td>{c.advisorAssigned}</td>
              <td>{c.status || "active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
