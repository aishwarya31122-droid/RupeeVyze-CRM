import { useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";
import CandidateCard from "../components/CandidateCard.jsx";
import CandidateModal from "../components/CandidateModal.jsx";
import CandidateForm from "../components/CandidateForm.jsx";
import { stageBadge } from "../data/dropdowns.js";

function Pipeline() {
  const { candidates, updateCandidateStage, updateCandidateNote, pipelineStages, sources, recruiterNames, addCandidate } = useCrm();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [recruiterFilter, setRecruiterFilter] = useState("All Recruiters");
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchText = [candidate.name, candidate.phone, candidate.source, candidate.recruitedBy].join(" ").toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStage = stageFilter === "All Stages" || candidate.stage === stageFilter;
      const matchesSource = sourceFilter === "All Sources" || candidate.source === sourceFilter;
      const matchesRecruiter = recruiterFilter === "All Recruiters" || candidate.recruitedBy === recruiterFilter;
      return matchesSearch && matchesStage && matchesSource && matchesRecruiter;
    });
  }, [candidates, search, stageFilter, sourceFilter, recruiterFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recruitment Pipeline</h1>
          <p>Manage candidate stages, follow-ups, and recruiter assignments.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setFormOpen(true)}>
          + Add Candidate
        </button>
      </div>

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by name or phone..."
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
        <select className="filter" value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)}>
          <option>All Recruiters</option>
          {recruiterNames.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="pipeline-grid">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onOpen={setActiveCandidate}
            stageColor={stageBadge[candidate.stage] || "#64748b"}
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
        />
      )}

      <CandidateForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onAdd={(candidateData) => {
          addCandidate(candidateData);
          setFormOpen(false);
        }}
      />
    </div>
  );
}

export default Pipeline;
