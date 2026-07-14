import React from "react";
import { teamMembers as initialTeam } from "../../data/team.js";

function ActiveAdvisors() {
  const advisors = initialTeam.filter((m) => m.role === "Advisor" || m.role === "Recruiter");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Active Advisors</h1>
          <p>List of active advisors and basic stats.</p>
        </div>
      </div>

      <div className="card">
        <div className="activity-list">
          {advisors.map((a) => (
            <div key={a.id} className="activity-item">
              <div className="activity-dot" style={{ background: "#16a34a" }} />
              <div>
                <strong>{a.name}</strong>
                <p>{a.city} • {a.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActiveAdvisors;
