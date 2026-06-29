import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCrm } from "../crmContext.jsx";
import StageSelect from "../components/StageSelect.jsx";
import { formatDate } from "../utils.js";

function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, updateCandidateStage, updateCandidateNote, pipelineStages } = useCrm();
  const [note, setNote] = useState("");

  const candidate = useMemo(
    () => candidates.find((item) => String(item.id) === id),
    [candidates, id]
  );

  useEffect(() => {
    if (candidate) {
      setNote(candidate.notes || "");
    }
  }, [candidate]);

  if (!candidate) {
    return (
      <div>
        <h1>Candidate not found</h1>
        <button onClick={() => navigate(-1)}>Back to Pipeline</button>
      </div>
    );
  }

  return (
    <div className="detail-card">
      <div className="page-header">
        <div>
          <h1>{candidate.name}</h1>
          <p>{candidate.email} • {candidate.phone}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <h3>Contact Info</h3>
          <p><strong>City:</strong> {candidate.city}</p>
          <p><strong>Source:</strong> {candidate.source}</p>
          <p><strong>Qualification:</strong> {candidate.qualification}</p>
          <p><strong>Advisor Code:</strong> {candidate.advisorCode || "Not assigned"}</p>
        </div>

        <div>
          <h3>Recruitment Workflow</h3>
          <p><strong>Stage</strong></p>
          <StageSelect
            stage={candidate.stage}
            onChange={(stage) => updateCandidateStage(candidate.id, stage)}
          />
          <p><strong>Training Status:</strong> {candidate.trainingStatus}</p>
          <p><strong>Exam Result:</strong> {candidate.examResult}</p>
          <p><strong>Follow-up Date:</strong> {formatDate(candidate.followUpDate)}</p>
        </div>
      </div>

      <div className="notes-panel">
        <h3>Notes</h3>
        <textarea
          className="details-notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add or update notes for this candidate"
        />
        <button
          className="primary"
          onClick={() => updateCandidateNote(candidate.id, note)}
        >
          Save Notes
        </button>
      </div>
    </div>
  );
}

export default CandidateDetails;