import React from "react";
import { initialClientLeads as clientData } from "../../data/clientCrmData";

export default function Policies() {
  const policies = (clientData || []).flatMap((c) => c.policies || []);

  return (
    <div>
      <h3>Policies</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Policy No</th>
            <th>Client</th>
            <th>Type</th>
            <th>Sum Assured</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.policyNumber}>
              <td>{p.policyNumber}</td>
              <td>{p.clientName}</td>
              <td>{p.policyType}</td>
              <td>{p.sumAssured}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
