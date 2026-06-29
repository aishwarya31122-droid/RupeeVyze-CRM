import React, { useState } from "react";
import { formatDate } from "../utils.js";
import StageSelect from "./StageSelect.jsx";

export default function CandidateModal({ candidate, stageOptions, stageColors, onClose, onStageUpdate, onNoteSave }) {
  const [note, setNote] = useState(candidate.notes || "");
  const [selectedStage, setSelectedStage] = useState(candidate.stage);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{candidate.name}</h2>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="modal-section">
          <p><strong>Phone:</strong> {candidate.phone}</p>
          <p><strong>Email:</strong> {candidate.email}</p>
          <p><strong>City:</strong> {candidate.city}</p>
          <p><strong>Recruited by:</strong> {candidate.recruitedBy}</p>
          <div className="modal-row">
            <strong>Stage:</strong>
            <StageSelect stage={selectedStage} onChange={(value) => setSelectedStage(value)} />
          </div>
          <p><strong>Follow-up:</strong> {formatDate(candidate.followUpDate)}</p>
        </div>

        <div className="modal-section">
          <h3>Timeline</h3>
          <div className="timeline">
            {stageOptions.map((stage) => (
              <div key={stage} className={`timeline-step ${candidate.stage === stage ? "active" : ""}`}>
                <span className="timeline-dot" style={{ backgroundColor: stageColors[stage] }} />
                <span>{stage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <h3>Notes</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="primary" onClick={() => onNoteSave(candidate.id, note)}>
            Save Note
          </button>
        </div>

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={() => onStageUpdate(candidate.id, selectedStage)}>
            Update Stage
          </button>
        </div>
      </div>
    </div>
  );
}
