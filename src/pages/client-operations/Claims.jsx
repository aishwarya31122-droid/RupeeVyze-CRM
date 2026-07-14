import React from "react";
import { initialClientLeads as clientData } from "../../data/clientCrmData";

export default function Claims() {
  const claims = (clientData || []).flatMap((c) => c.claims || []);

  return (
    <div>
      <h3>Claims</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Policy</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.claimId}>
              <td>{c.claimId}</td>
              <td>{c.policyNumber}</td>
              <td>{c.clientName}</td>
              <td>{c.amount}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
