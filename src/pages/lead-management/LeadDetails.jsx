import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const tabs = ["Overview", "Timeline", "Activities", "Documents", "Communication", "Tasks", "Notes", "History", "Conversion"];

function LeadDetails({ leads = [], onUpdate }) {
  const { id } = useParams();
  const lead = useMemo(() => leads.find((l) => l.id === id) || leads[0], [id, leads]);
  const [active, setActive] = useState("Overview");

  // local editable state for tasks, communications and documents
  const [tasks, setTasks] = useState(() => (lead?.tasks ? [...lead.tasks] : []));
  const [communications, setCommunications] = useState(() => (lead?.communication ? [...lead.communication] : []));
  const [documents, setDocuments] = useState(() => (lead?.documents ? [...lead.documents] : []));

  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", dueDate: "", priority: "Medium" });
  const [newComm, setNewComm] = useState({ type: "Call", date: "", remarks: "" });
  const [newDocName, setNewDocName] = useState("");

  if (!lead) return <div className="card">No lead found</div>;

  const handleAddTask = () => {
    const id = `T-${Date.now()}`;
    const task = { id, ...newTask, status: "Open" };
    const updated = [...tasks, task];
    setTasks(updated);
    setNewTask({ title: "", assignedTo: "", dueDate: "", priority: "Medium" });
    onUpdate?.({ ...lead, tasks: updated });
  };

  const handleAddCommunication = () => {
    const comm = { ...newComm };
    const updated = [...communications, comm];
    setCommunications(updated);
    setNewComm({ type: "Call", date: "", remarks: "" });
    onUpdate?.({ ...lead, communication: updated });
  };

  const handleAddDocument = () => {
    if (!newDocName) return;
    const updated = [...documents, newDocName];
    setDocuments(updated);
    setNewDocName("");
    onUpdate?.({ ...lead, documents: updated });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{lead.name}</h1>
          <p>{lead.leadType} • {lead.city}</p>
        </div>
      </div>

      <div className="tab-row">
        {tabs.map((t) => (
          <button key={t} className={`tab-btn ${active === t ? "active" : ""}`} onClick={() => setActive(t)}>{t}</button>
        ))}
      </div>

      {active === "Overview" && (
        <div className="card detail-card">
          <h3>Overview</h3>
          <div className="detail-grid-stack">
            <div className="detail-item"><span>Lead ID</span><strong>{lead.leadId}</strong></div>
            <div className="detail-item"><span>Type</span><strong>{lead.leadType}</strong></div>
            <div className="detail-item"><span>Assigned To</span><strong>{lead.assignedTo}</strong></div>
            <div className="detail-item"><span>Stage</span><strong>{lead.stage}</strong></div>
            <div className="detail-item"><span>Next Follow-up</span><strong>{lead.nextFollowUp}</strong></div>
            <div className="detail-item"><span>Notes</span><strong>{lead.notes}</strong></div>
          </div>
        </div>
      )}

      {active === "Timeline" && (
        <div className="card">
          <h3>Timeline</h3>
          <div className="timeline">
            {(lead.timeline || []).map((t, i) => (
              <div key={`${t.stage}-${i}`} className={`timeline-step`}>
                <span>{t.stage} — {t.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Activities" && (
        <div className="card">
          <h3>Activities</h3>
          <div className="activity-list">
            {(lead.activities || []).map((a, i) => (
              <div key={`${a.type}-${i}`} className="activity-item">
                <div className="activity-dot" style={{ background: "#2563eb" }} />
                <div>
                  <strong>{a.type}</strong>
                  <p>{a.text}</p>
                </div>
                <span>{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Documents" && (
        <div className="card">
          <h3>Documents</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="attachment-grid">
                {documents.map((d, i) => (
                  <div className="attachment-card" key={i}><span className="attachment-icon">📄</span><strong>{d}</strong></div>
                ))}
              </div>
            </div>

            <div style={{ width: 280 }}>
              <h4>Add Document</h4>
              <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Document name" />
              <div style={{ marginTop: 8 }}>
                <button className="button primary" onClick={handleAddDocument}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === "Communication" && (
        <div className="card">
          <h3>Communication</h3>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="activity-list">
                {communications.map((c, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" style={{ background: "#10b981" }} />
                    <div>
                      <strong>{c.type}</strong>
                      <p>{c.remarks}</p>
                    </div>
                    <span>{c.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: 320 }}>
              <h4>Log Communication</h4>
              <label>Type</label>
              <select value={newComm.type} onChange={(e) => setNewComm((s) => ({ ...s, type: e.target.value }))}>
                <option>Call</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Meeting</option>
              </select>
              <label>Date</label>
              <input type="date" value={newComm.date} onChange={(e) => setNewComm((s) => ({ ...s, date: e.target.value }))} />
              <label>Remarks</label>
              <textarea value={newComm.remarks} onChange={(e) => setNewComm((s) => ({ ...s, remarks: e.target.value }))} />
              <div style={{ marginTop: 8 }}>
                <button className="button primary" onClick={handleAddCommunication}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === "Tasks" && (
        <div className="card">
          <h3>Tasks</h3>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div className="activity-list">
                {tasks.map((t) => (
                  <div key={t.id} className="activity-item">
                    <div className="activity-dot" style={{ background: "#f59e0b" }} />
                    <div>
                      <strong>{t.title}</strong>
                      <p>{t.assignedTo} • Due {t.dueDate}</p>
                    </div>
                    <span>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: 320 }}>
              <h4>Create Task</h4>
              <label>Title</label>
              <input value={newTask.title} onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))} />
              <label>Assigned To</label>
              <input value={newTask.assignedTo} onChange={(e) => setNewTask((s) => ({ ...s, assignedTo: e.target.value }))} />
              <label>Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((s) => ({ ...s, dueDate: e.target.value }))} />
              <label>Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask((s) => ({ ...s, priority: e.target.value }))}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <div style={{ marginTop: 8 }}>
                <button className="button primary" onClick={handleAddTask}>Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === "History" && (
        <div className="card">
          <h3>Assignment History</h3>
          <div className="activity-list">
            {(lead.timeline || []).map((t, i) => (
              <div key={`${t.stage}-hist-${i}`} className="activity-item">
                <div className="activity-dot" style={{ background: "#64748b" }} />
                <div>
                  <strong>{t.stage}</strong>
                  <p>{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "Conversion" && (
        <div className="card">
          <h3>Conversion Journey</h3>
          <div className="timeline">
            {(lead.timeline || []).map((t, i) => (
              <div key={`${t.stage}-conv-${i}`} className={`timeline-step`}>
                <span>{t.stage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default LeadDetails;
