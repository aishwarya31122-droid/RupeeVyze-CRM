import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { useCrm } from "../crmContext.jsx";
import StageSelect from "../components/StageSelect.jsx";
import { formatDate, getFollowUpDate } from "../utils.js";

const tabs = [
  "Overview",
  "Timeline",
  "Activities",
  "Documents",
  "Communication",
  "Tasks",
  "Notes",
  "History",
  "Conversion"
];

function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, updateCandidateStage, updateCandidateNote, updateCandidate } = useCrm();
  const [activeTab, setActiveTab] = useState("Overview");
  const [note, setNote] = useState("");
  const [tasks, setTasks] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", assignedTo: "", dueDate: "", priority: "Medium" });
  const [newComm, setNewComm] = useState({ type: "Call", date: "", remarks: "" });
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const candidate = useMemo(
    () => candidates.find((item) => String(item.id) === id),
    [candidates, id]
  );

  const currentIndex = useMemo(() => candidates.findIndex((item) => String(item.id) === id), [candidates, id]);
  const previousLead = currentIndex > 0 ? candidates[currentIndex - 1] : null;
  const nextLead = currentIndex >= 0 && currentIndex < candidates.length - 1 ? candidates[currentIndex + 1] : null;

  const availableDocumentTypes = useMemo(() => {
    if (candidate?.leadType === "Advisor Recruitment") {
      return [
        "Aadhaar Card",
        "PAN Card",
        "Passport Size Photo",
        "Bank Passbook",
        "Cancelled Cheque",
        "Educational Certificate",
        "IRDA Certificate (if applicable)",
        "Address Proof",
        "Other"
      ];
    }

    return [
      "Aadhaar Card",
      "PAN Card",
      "Proposal Form",
      "Medical Reports",
      "Income Proof",
      "Address Proof",
      "Policy Documents",
      "Nominee Proof",
      "Other"
    ];
  }, [candidate?.leadType]);

  useEffect(() => {
    if (candidate) {
      setNote(candidate.notes || "");
      setTasks(candidate.tasks ? [...candidate.tasks] : []);
      setCommunications(candidate.communication ? [...candidate.communication] : []);
      setDocuments(candidate.documents ? [...candidate.documents] : []);
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

  const handleSaveNote = () => {
    updateCandidateNote(candidate.id, note);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const updated = [...tasks, { ...newTask, id: `T-${Date.now()}`, status: "Open" }];
    setTasks(updated);
    setNewTask({ title: "", assignedTo: "", dueDate: "", priority: "Medium" });
    updateCandidate(candidate.id, { tasks: updated });
  };

  const handleAddCommunication = () => {
    if (!newComm.remarks.trim()) return;
    const updated = [...communications, newComm];
    setCommunications(updated);
    setNewComm({ type: "Call", date: "", remarks: "" });
    updateCandidate(candidate.id, { communication: updated });
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleUploadDocument = () => {
    if (!documentType || !selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const interval = window.setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 120);

    window.setTimeout(() => {
      window.clearInterval(interval);
      setUploading(false);
      setUploadProgress(100);
      const updatedDocuments = [...(candidate.documents || []), documentType];
      setDocuments(updatedDocuments);
      setUploadedDocument({
        type: documentType,
        fileName: selectedFile.name,
        uploadedAt: new Date().toLocaleString(),
        uploadedBy: "Current User",
        status: "Uploaded"
      });
      updateCandidate(candidate.id, { documents: updatedDocuments, updatedAt: new Date().toISOString() });
      setSelectedFile(null);
    }, 700);
  };

  const handleReplaceDocument = () => {
    setUploadedDocument(null);
    setSelectedFile(null);
    setDocumentType("");
    setUploadProgress(0);
    setUploading(false);
  };

  const handleDeleteDocument = () => {
    setUploadedDocument(null);
    setSelectedFile(null);
    setDocumentType("");
    setUploadProgress(0);
    setUploading(false);
  };

  return (
    <div className="detail-card">
      <div className="page-header">
        <div>
          <h1>{candidate.name}</h1>
          <p>360° Lead Profile • {candidate.leadId || candidate.advisorCode || candidate.email} • {candidate.city || candidate.phone}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="button secondary" onClick={() => previousLead && navigate(`/adviser/lead-management/lead/${previousLead.id}`)} disabled={!previousLead}>
            ← Previous Lead
          </button>
          <button type="button" className="button secondary" onClick={() => nextLead && navigate(`/adviser/lead-management/lead/${nextLead.id}`)} disabled={!nextLead}>
            Next Lead →
          </button>
        </div>
      </div>

      <div className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="card detail-card">
          <div className="detail-grid">
            <div>
              <h3>Lead Information</h3>
              <div className="detail-item"><span>Lead ID</span><strong>{candidate.leadId || candidate.id}</strong></div>
              <div className="detail-item"><span>Name</span><strong>{candidate.name}</strong></div>
              <div className="detail-item"><span>Lead Type</span><strong>{candidate.leadType}</strong></div>
              <div className="detail-item"><span>Mobile</span><strong>{candidate.phone}</strong></div>
              <div className="detail-item"><span>Email</span><strong>{candidate.email}</strong></div>
              <div className="detail-item"><span>City</span><strong>{candidate.city}</strong></div>
              <div className="detail-item"><span>Lead Source</span><strong>{candidate.leadSource || candidate.source || "Not specified"}</strong></div>
            </div>

            <div>
              <h3>Current Status</h3>
              <div className="detail-item">
                <span>Workflow Stage</span>
                <StageSelect
                  stage={candidate.workflowStage}
                  leadType={candidate.leadType}
                  onChange={(stage) => updateCandidateStage(candidate.id, stage)}
                />
              </div>
              <div className="detail-item"><span>Lead Status</span><strong>{candidate.leadStatus}</strong></div>
              <div className="detail-item"><span>Assigned To</span><strong>{candidate.assignedTo || "Unassigned"}</strong></div>
              <div className="detail-item"><span>Priority</span><strong>{candidate.priority || candidate.followUp?.priority || "Medium"}</strong></div>
              <div className="detail-item"><span>Next Follow-up</span><strong>{formatDate(candidate.nextFollowUp || candidate.followUpDate)}</strong></div>
            </div>

            <div>
              <h3>Business Details</h3>
              <div className="detail-item"><span>Advisor Name</span><strong>{candidate.advisorName || "Not applicable"}</strong></div>
              <div className="detail-item"><span>Policy Interest</span><strong>{candidate.policyInterest || "Not applicable"}</strong></div>
              <div className="detail-item"><span>Notes</span><strong>{candidate.notes || "No notes provided."}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Timeline" && (
        <div className="card">
          <h3>Timeline</h3>
          {(candidate.timeline || []).length > 0 ? (
            <div className="timeline">
              {candidate.timeline.map((item, index) => (
                <div key={`${item.stage}-${index}`} className="timeline-step">
                  <span>{item.stage}</span>
                  <p>{item.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No timeline entries available.</p>
          )}
        </div>
      )}

      {activeTab === "Activities" && (
        <div className="card">
          <h3>Activities</h3>
          {(candidate.activities || []).length > 0 ? (
            <div className="activity-list">
              {candidate.activities.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="activity-item">
                  <div className="activity-dot" style={{ background: "#2563eb" }} />
                  <div>
                    <strong>{activity.type}</strong>
                    <p>{activity.text}</p>
                  </div>
                  <span>{activity.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No activity records found.</p>
          )}
        </div>
      )}

      {activeTab === "Documents" && (
        <div className="card">
          <h3>Documents</h3>

          {uploadedDocument ? (
            <Card variant="outlined" sx={{ borderColor: "success.main", bgcolor: "success.50" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" color="success.main">✅ Successfully Uploaded</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary">Document Type</Typography>
                      <Typography variant="subtitle1" fontWeight={600}>{uploadedDocument.type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">File Name</Typography>
                      <Typography variant="subtitle1" fontWeight={600}>{uploadedDocument.fileName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Upload Date & Time</Typography>
                      <Typography variant="subtitle1" fontWeight={600}>{uploadedDocument.uploadedAt}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Uploaded By</Typography>
                      <Typography variant="subtitle1" fontWeight={600}>{uploadedDocument.uploadedBy}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Typography variant="subtitle1" fontWeight={600} color="success.main">{uploadedDocument.status}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button variant="outlined" size="small">View</Button>
                    <Button variant="outlined" size="small" onClick={handleReplaceDocument}>Replace</Button>
                    <Button variant="outlined" color="error" size="small" onClick={handleDeleteDocument}>Delete</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderStyle: "dashed", borderColor: "grey.400", bgcolor: "grey.50" }}>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="document-type-label">Select Document Type</InputLabel>
                  <Select
                    labelId="document-type-label"
                    value={documentType}
                    label="Select Document Type"
                    onChange={(event) => setDocumentType(event.target.value)}
                  >
                    {availableDocumentTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {documentType && (
                  <Stack spacing={2}>
                    <Button component="label" variant="outlined" fullWidth>
                      Choose File
                      <input hidden type="file" onChange={handleFileSelection} />
                    </Button>

                    {selectedFile ? (
                      <Alert severity="info">Selected file: {selectedFile.name}</Alert>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Choose a file to begin the upload process.</Typography>
                    )}

                    <Button variant="contained" onClick={handleUploadDocument} disabled={!selectedFile || uploading}>
                      Upload
                    </Button>

                    {uploading && (
                      <Box>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="caption" color="text.secondary">Uploading document... {uploadProgress}%</Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          {(documents || []).length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>Existing Documents</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {documents.map((doc, index) => (
                  <Chip key={`${doc}-${index}`} label={doc} variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}
        </div>
      )}

      {activeTab === "Communication" && (
        <div className="card">
          <h3>Communication</h3>
          {(communications || []).length > 0 ? (
            <div className="activity-list">
              {communications.map((comm, index) => (
                <div key={`${comm.type}-${index}`} className="activity-item">
                  <div className="activity-dot" style={{ background: "#10b981" }} />
                  <div>
                    <strong>{comm.type}</strong>
                    <p>{comm.remarks}</p>
                  </div>
                  <span>{comm.date || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No communication entries available.</p>
          )}
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <label>
              <span>Type</span>
              <select value={newComm.type} onChange={(e) => setNewComm((prev) => ({ ...prev, type: e.target.value }))}>
                <option>Call</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Meeting</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={newComm.date} onChange={(e) => setNewComm((prev) => ({ ...prev, date: e.target.value }))} />
            </label>
            <label>
              <span>Remarks</span>
              <textarea value={newComm.remarks} onChange={(e) => setNewComm((prev) => ({ ...prev, remarks: e.target.value }))} />
            </label>
            <button className="button primary" onClick={handleAddCommunication}>Save Communication</button>
          </div>
        </div>
      )}

      {activeTab === "Tasks" && (
        <div className="card">
          <h3>Tasks</h3>
          {(tasks || []).length > 0 ? (
            <div className="activity-list">
              {tasks.map((task) => (
                <div key={task.id} className="activity-item">
                  <div className="activity-dot" style={{ background: "#f59e0b" }} />
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.assignedTo} • Due {task.dueDate}</p>
                  </div>
                  <span>{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks found.</p>
          )}
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <label>
              <span>Title</span>
              <input value={newTask.title} onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))} />
            </label>
            <label>
              <span>Assigned To</span>
              <input value={newTask.assignedTo} onChange={(e) => setNewTask((prev) => ({ ...prev, assignedTo: e.target.value }))} />
            </label>
            <label>
              <span>Due Date</span>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))} />
            </label>
            <label>
              <span>Priority</span>
              <select value={newTask.priority} onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <button className="button primary" onClick={handleAddTask}>Add Task</button>
          </div>
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="card">
          <h3>Notes</h3>
          <textarea
            className="details-notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add or update notes for this candidate"
          />
          <button className="primary" onClick={handleSaveNote}>Save Notes</button>
        </div>
      )}

      {activeTab === "History" && (
        <div className="card">
          <h3>Assignment History</h3>
          {(candidate.timeline || []).length > 0 ? (
            <div className="activity-list">
              {candidate.timeline.map((item, index) => (
                <div key={`${item.stage}-hist-${index}`} className="activity-item">
                  <div className="activity-dot" style={{ background: "#64748b" }} />
                  <div>
                    <strong>{item.stage}</strong>
                    <p>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No history available.</p>
          )}
        </div>
      )}

      {activeTab === "Conversion" && (
        <div className="card">
          <h3>Conversion Journey</h3>
          {(candidate.timeline || []).length > 0 ? (
            <div className="timeline">
              {candidate.timeline.map((item, index) => (
                <div key={`${item.stage}-conv-${index}`} className="timeline-step">
                  <span>{item.stage}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No conversion history found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CandidateDetails;