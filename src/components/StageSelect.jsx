import React from "react";
import { useCrm } from "../crmContext.jsx";
import { getAllowedStageOptions } from "../utils";

export default function StageSelect({ stage, leadType, onChange, disabled }) {
  const { advisorWorkflowStages, customerWorkflowStages } = useCrm();
  const availableStages = leadType === "Insurance Customer" ? customerWorkflowStages : advisorWorkflowStages;
  const stageOptions = availableStages.includes(stage) ? availableStages : [stage, ...availableStages];
  const options = getAllowedStageOptions(stageOptions, stage);

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
