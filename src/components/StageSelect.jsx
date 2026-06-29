import React from "react";
import { useCrm } from "../crmContext.jsx";
import { getAllowedStageOptions } from "../utils";

export default function StageSelect({ stage, onChange, disabled }) {
  const { pipelineStages } = useCrm();
  const options = getAllowedStageOptions(pipelineStages, stage);

  return (
    <select value={stage} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
