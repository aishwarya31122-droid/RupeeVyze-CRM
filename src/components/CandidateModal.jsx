import React, { useState } from "react";
import { useCrm } from "../crmContext.jsx";
import { formatDate } from "../utils.js";
import StageSelect from "./StageSelect.jsx";

export default function CandidateModal({ candidate, stageOptions, stageColors, onClose, onStageUpdate, onNoteSave, onSave, pipelineStages: propPipelineStages, sources: propSources }) {
  const { pipelineStages: contextStages, sources: contextSources } = useCrm();
  const pipelineStages = propPipelineStages || contextStages;
  const sources = propSources || contextSources;
  const [form, setForm] = useState({
    name: candidate.name || "",
    mobile: candidate.mobile || candidate.phone || "",
    email: candidate.email || "",
    city: candidate.city || "",
    leadSource: candidate.leadSource || candidate.source || "",
    workflowStage: candidate.workflowStage || pipelineStages[0],
    leadStatus: candidate.leadStatus || "Open",
    assignedTo: candidate.assignedTo || "",
    followUpDate: candidate.nextFollowUp || candidate.followUpDate || "",
    notes: candidate.notes || ""
  });
  const [selectedStage, setSelectedStage] = useState(candidate.workflowStage || candidate.stage || pipelineStages[0]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      mobile: form.mobile || candidate.mobile || candidate.phone || "",
      phone: form.mobile || candidate.mobile || candidate.phone || "",
      workflowStage: selectedStage,
      leadSource: form.leadSource || candidate.leadSource || candidate.source || "",
      source: form.leadSource || candidate.leadSource || candidate.source || "",
      leadStatus: form.leadStatus || candidate.leadStatus || "Open",
      assignedTo: form.assignedTo || candidate.assignedTo || "",
      nextFollowUp: form.followUpDate || candidate.nextFollowUp || candidate.followUpDate || "",
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
            <p className="section-kicker">Edit Lead</p>
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
            <span>Mobile Number</span>
            <input name="mobile" value={form.mobile} onChange={handleChange} />
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
            <span>Lead Source</span>
            <select name="leadSource" value={form.leadSource} onChange={handleChange}>
              {sources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Workflow Stage</span>
            <StageSelect stage={selectedStage} leadType={candidate.leadType} onChange={(value) => setSelectedStage(value)} />
          </label>
          <label>
            <span>Lead Status</span>
            <select name="leadStatus" value={form.leadStatus} onChange={handleChange}>
              <option>Open</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Converted</option>
              <option>Lost</option>
            </select>
          </label>
          <label>
            <span>Assigned To</span>
            <input name="assignedTo" value={form.assignedTo} onChange={handleChange} />
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
              <div key={stage} className={`timeline-step ${selectedStage === stage ? "active" : ""}`}>
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
