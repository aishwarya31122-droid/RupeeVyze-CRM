import React from "react";
import { initialClientLeads as clientData } from "../../data/clientCrmData";

export default function Renewals() {
  const renewals = (clientData || []).flatMap((c) => c.renewals || []);

  return (
    <div>
      <h3>Renewals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Policy No</th>
            <th>Client</th>
            <th>Due Date</th>
            <th>Premium</th>
            <th>Advisor</th>
          </tr>
        </thead>
        <tbody>
          {renewals.map((r, idx) => (
            <tr key={idx}>
              <td>{r.policyNumber}</td>
              <td>{r.clientName}</td>
              <td>{r.dueDate}</td>
              <td>{r.premium}</td>
              <td>{r.advisor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
