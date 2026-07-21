import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

function shouldShowField(field, formValues, allStageFields, currentStage) {
  if (!field.dependsOn) return true;
  const val = formValues[field.dependsOn.field];
  const expected = field.dependsOn.value;
  if (Array.isArray(expected)) {
    return expected.includes(val);
  }
  return val === expected;
}

export function getStageFields(stageConfig, stage) {
  return stageConfig[stage] || [];
}

export function getStageDefaultValues(stageConfig, stage) {
  const fields = getStageFields(stageConfig, stage);
  const values = {};
  for (const f of fields) {
    values[f.name] = "";
  }
  return values;
}

export function clearHiddenStageFields(form, stageConfig, stage) {
  const visibleFields = new Set();
  const fieldDefs = getStageFields(stageConfig, stage);
  for (const f of fieldDefs) {
    visibleFields.add(f.name);
  }
  const cleaned = { ...form };
  for (const key of Object.keys(cleaned)) {
    if (!visibleFields.has(key) && key !== "name" && key !== "mobile" && key !== "email" && key !== "city" && key !== "qualification" && key !== "source" && key !== "leadType" && key !== "workflowStage" && key !== "notes") {
      cleaned[key] = "";
    }
  }
  return cleaned;
}

export default function StageForm({ stageConfig, stage, form, errors, onChange }) {
  const fields = getStageFields(stageConfig, stage);

  return fields.map((field) => {
    if (!shouldShowField(field, form, stageConfig, stage)) return null;

    const commonProps = {
      fullWidth: true,
      margin: "dense",
      key: field.name,
      name: field.name,
      value: form[field.name] || "",
      onChange,
      error: !!errors[field.name],
      helperText: errors[field.name] || ""
    };

    if (field.type === "select") {
      return (
        <TextField select {...commonProps} label={field.label}>
          {field.options.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.type === "date") {
      return (
        <TextField {...commonProps} label={field.label} type="date" InputLabelProps={{ shrink: true }} />
      );
    }

    if (field.type === "textarea") {
      return (
        <TextField {...commonProps} label={field.label} multiline rows={field.rows || 2} />
      );
    }

    return (
      <TextField {...commonProps} label={field.label} />
    );
  });
}
