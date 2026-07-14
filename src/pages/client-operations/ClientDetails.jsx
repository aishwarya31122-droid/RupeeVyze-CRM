import React from "react";
import { useParams } from "react-router-dom";
import { initialClientLeads as clientData } from "../../data/clientCrmData";

export default function ClientDetails() {
  const { id } = useParams();
  const client = (clientData || []).find((c) => String(c.clientId) === String(id));

  if (!client) return <div>Client not found</div>;

  return (
    <div>
      <h3>{client.name} — {client.clientId}</h3>
      <p><strong>Mobile:</strong> {client.mobile}</p>
      <p><strong>City:</strong> {client.city}</p>
      <p><strong>Advisor:</strong> {client.advisorAssigned}</p>
      <p><strong>Policy Number:</strong> {client.policyNumber || "—"}</p>
      <h4>Summary</h4>
      <pre>{JSON.stringify(client, null, 2)}</pre>
    </div>
  );
}
