import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../utils.js";

export default function CandidateCard({ candidate, onOpen, stageColor, detailsPrefix = "/adviser/lead-management/lead" }) {
  const navigate = useNavigate();

  return (
    <div className="candidate-card" onClick={() => navigate(`${detailsPrefix}/${candidate.id}`)}>
      <div className="card-header">
        <div>
          <h3>{candidate.name}</h3>
          <p>{candidate.mobile || candidate.phone}</p>
        </div>
        <span className="badge" style={{ backgroundColor: stageColor }}>
          {candidate.workflowStage}
        </span>
      </div>
      <p>{candidate.leadSource || candidate.source} · {candidate.recruitedBy || candidate.assignedTo}</p>
      <div className="card-row">
        <span>Next Follow-up: {formatDate(candidate.followUpDate || candidate.nextFollowUp)}</span>
        <span>{candidate.priority || candidate.followUp?.priority || "Medium"} priority</span>
      </div>
      <div className="card-actions">
        <Link
          className="button secondary"
          to={`${detailsPrefix}/${candidate.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          View Details
        </Link>
        <button
          type="button"
          className="button primary"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(candidate);
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
