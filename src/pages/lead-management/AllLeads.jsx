import React from "react";
import { Link } from "react-router-dom";

function AllLeads({ leads = [] }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Leads</h1>
          <p>Table of all leads (advisor + client).</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Assigned To</th>
                <th>Stage</th>
                <th>Next Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.leadId}</td>
                  <td>{l.name}</td>
                  <td>{l.leadType}</td>
                  <td>{l.city}</td>
                  <td>{l.assignedTo}</td>
                  <td>{l.stage}</td>
                  <td>{l.nextFollowUp}</td>
                  <td>
                    <Link className="button secondary" to={`/adviser/lead-management/lead/${l.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllLeads;
