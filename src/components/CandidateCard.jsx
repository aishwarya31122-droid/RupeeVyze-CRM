import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils.js";

export default function CandidateCard({ candidate, onOpen, stageColor }) {
  return (
    <div className="candidate-card" onClick={() => onOpen(candidate)}>
      <div className="card-header">
        <div>
          <h3>{candidate.name}</h3>
          <p>{candidate.phone}</p>
        </div>
        <span className="badge" style={{ backgroundColor: stageColor }}>
          {candidate.stage}
        </span>
      </div>
      <p>{candidate.source} · {candidate.recruitedBy}</p>
      <div className="card-row">
        <span>Follow-up: {formatDate(candidate.followUpDate)}</span>
        <span>{candidate.followUp.priority} priority</span>
      </div>
      <div className="card-actions">
        <Link
          className="button secondary"
          to={`/adviser/candidate/${candidate.id}`}
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
