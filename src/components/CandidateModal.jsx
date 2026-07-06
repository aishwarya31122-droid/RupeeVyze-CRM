import React, { useState } from "react";
import { useCrm } from "../crmContext.jsx";
import { formatDate } from "../utils.js";
import StageSelect from "./StageSelect.jsx";

export default function CandidateModal({ candidate, stageOptions, stageColors, onClose, onStageUpdate, onNoteSave, onSave }) {
  const { pipelineStages, sources, recruiterNames } = useCrm();
  const [form, setForm] = useState({
    name: candidate.name || "",
    phone: candidate.phone || "",
    email: candidate.email || "",
    city: candidate.city || "",
    qualification: candidate.qualification || "",
    source: candidate.source || "",
    stage: candidate.stage || pipelineStages[0],
    trainingStatus: candidate.trainingStatus || "Pending",
    examResult: candidate.examResult || "Pending",
    followUpDate: candidate.followUpDate || "",
    notes: candidate.notes || ""
  });
  const [selectedStage, setSelectedStage] = useState(candidate.stage);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      stage: selectedStage,
      followUpDate: form.followUpDate || "",
      followUp: {
        ...candidate.followUp,
        type: candidate.followUp?.type || "Phone Call",
        priority: candidate.followUp?.priority || "Medium",
        status: candidate.followUp?.status || "Pending"
      }
    };

    if (onSave) {
      onSave(candidate.id, payload);
    } else {
      onStageUpdate(candidate.id, selectedStage);
      onNoteSave(candidate.id, form.notes);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="section-kicker">Edit Candidate</p>
            <h2>{candidate.name}</h2>
          </div>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="modal-grid">
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            <span>Phone Number</span>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            <span>Email</span>
            <input name="email" value={form.email} onChange={handleChange} />
          </label>
          <label>
            <span>City</span>
            <input name="city" value={form.city} onChange={handleChange} />
          </label>
          <label>
            <span>Qualification</span>
            <input name="qualification" value={form.qualification} onChange={handleChange} />
          </label>
          <label>
            <span>Source</span>
            <select name="source" value={form.source} onChange={handleChange}>
              {sources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Recruitment Stage</span>
            <StageSelect stage={selectedStage} onChange={(value) => setSelectedStage(value)} />
          </label>
          <label>
            <span>Training Status</span>
            <select name="trainingStatus" value={form.trainingStatus} onChange={handleChange}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
          <label>
            <span>Exam Result</span>
            <select name="examResult" value={form.examResult} onChange={handleChange}>
              <option>Pending</option>
              <option>Passed</option>
              <option>Failed</option>
            </select>
          </label>
          <label>
            <span>Follow-up Date</span>
            <input type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
          </label>
          <label className="full-width">
            <span>Notes</span>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </label>
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

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
