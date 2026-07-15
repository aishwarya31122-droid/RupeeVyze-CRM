import { useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";
import CandidateCard from "../components/CandidateCard.jsx";
import CandidateModal from "../components/CandidateModal.jsx";
import CandidateForm from "../components/CandidateForm.jsx";
import { stageBadge } from "../data/dropdowns.js";

function Pipeline({
  candidates: propCandidates,
  updateCandidateStage: propUpdateCandidateStage,
  updateCandidate: propUpdateCandidate,
  updateCandidateNote: propUpdateCandidateNote,
  addCandidate: propAddCandidate,
  pipelineStages: propPipelineStages,
  sources: propSources,
  recruiterNames: propRecruiterNames,
  detailsPrefix
}) {
  const crm = useCrm();
  const candidates = propCandidates || crm.candidates;
  const updateCandidateStage = propUpdateCandidateStage || crm.updateCandidateStage;
  const updateCandidate = propUpdateCandidate || crm.updateCandidate;
  const updateCandidateNote = propUpdateCandidateNote || crm.updateCandidateNote;
  const addCandidate = propAddCandidate || crm.addCandidate;
  const pipelineStages = propPipelineStages || crm.pipelineStages;
  const sources = propSources || crm.sources;
  const recruiterNames = propRecruiterNames || crm.recruiterNames;
  const detailsPathPrefix = detailsPrefix || "/adviser/lead-management/lead";
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [recruiterFilter, setRecruiterFilter] = useState("All Recruiters");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const cityOptions = useMemo(() => [...new Set(candidates.map((candidate) => candidate.city).filter(Boolean))], [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchText = [candidate.name, candidate.mobile, candidate.phone, candidate.email, candidate.city].join(" ").toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStage = stageFilter === "All Stages" || candidate.workflowStage === stageFilter;
      const matchesSource = sourceFilter === "All Sources" || candidate.source === sourceFilter || candidate.leadSource === sourceFilter;
      const matchesRecruiter = recruiterFilter === "All Recruiters" || candidate.recruitedBy === recruiterFilter || candidate.assignedTo === recruiterFilter;
      const matchesCity = cityFilter === "All Cities" || candidate.city === cityFilter;
      return matchesSearch && matchesStage && matchesSource && matchesRecruiter && matchesCity;
    });
  }, [candidates, search, stageFilter, sourceFilter, recruiterFilter, cityFilter]);

  const exportCsv = () => {
    const rows = [
      ["Name", "Phone", "Email", "City", "Source", "Recruiter", "Stage", "Follow-up Date", "Notes"],
      ...filteredCandidates.map((candidate) => [
        candidate.name,
        candidate.mobile || candidate.phone,
        candidate.email,
        candidate.city,
        candidate.leadSource || candidate.source,
        candidate.assignedTo || candidate.recruitedBy || "",
        candidate.workflowStage,
        candidate.nextFollowUp || candidate.followUpDate || "",
        candidate.notes
      ])
    ];

    const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lead_pipeline.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Lead Pipeline</h1>
          <p>Manage lead stages, follow-ups, and recruiter assignments.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="secondary-btn" onClick={exportCsv}>
            Export CSV
          </button>
          <button type="button" className="primary-btn" onClick={() => setFormOpen(true)}>
            + Add Lead
          </button>
        </div>
      </div>

      <div className="filters-card">
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search lead by name, phone, email or city"
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filter" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option>All Stages</option>
            {pipelineStages.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
          <select className="filter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option>All Sources</option>
            {sources.map((source) => (
              <option key={source}>{source}</option>
            ))}
          </select>
          <select className="filter" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option>All Cities</option>
            {cityOptions.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          <select className="filter" value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)}>
            <option>All Recruiters</option>
            {recruiterNames.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pipeline-grid">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onOpen={setActiveCandidate}
            stageColor={stageBadge[candidate.workflowStage] || "#64748b"}
            detailsPrefix={detailsPathPrefix}
          />
        ))}
      </div>

      {activeCandidate && (
        <CandidateModal
          candidate={activeCandidate}
          stageOptions={pipelineStages}
          stageColors={stageBadge}
          onClose={() => setActiveCandidate(null)}
          onStageUpdate={(id, stage) => {
            updateCandidateStage(id, stage);
            setActiveCandidate(null);
          }}
          onNoteSave={(id, note) => {
            updateCandidateNote(id, note);
            setActiveCandidate(null);
          }}
          onSave={(id, payload) => {
            updateCandidate(id, payload);
            setActiveCandidate(null);
          }}
        />
      )}

      <CandidateForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onAdd={(candidateData) => {
          addCandidate(candidateData);
          setFormOpen(false);
        }}
        pipelineStages={pipelineStages}
        sources={sources}
      />
    </div>
  );
}

export default Pipeline;
