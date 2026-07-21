import React, { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCrm } from "../crmContext.jsx";

// ─── Normalization ──────────────────────────────────────────────────────

function normalizeHeader(h) {
  return String(h || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─── Content-based file type detection ──────────────────────────────────

const TYPE_SIGNATURES = {
  advisors: [
    "recruitmentstage", "advisorcode", "trainingstatus", "examresult",
    "activationdate", "documentsubmittedtotata", "documentssubmitted",
    "naafstatus", "naafgeneration", "activationstatus", "codegenerationstatus",
    "qualification", "recruitmentsource", "codeissuedate", "naafgenerationdate",
    "trainingcompletiondate", "examdate", "dropreason"
  ],
  leads: [
    "leadsource", "interestlevel", "assignedadvisor",
    "leadstatus", "contactnumber", "leadtype"
  ],
  clients: [
    "clientid", "advisorassigned", "datereceived",
    "followupstatus", "leadquality", "nextfollowupdate", "finalstatus"
  ],
  policies: [
    "policytype", "sumassured", "issuedate", "renewaldate", "policystatus"
  ],
  claims: [
    "claimnumber", "claimstatus", "claimamount", "settlementdate"
  ],
  rewards: [
    "reward", "points", "incentive", "rewardtype"
  ],
  teamMembers: [
    "employeename", "department", "designation", "employeestatus"
  ],
  followups: [
    "followuptype", "followupstatus", "followuppriority"
  ]
};

const TYPE_LABELS = {
  advisors: "Advisor Data",
  leads: "Lead Data",
  clients: "Client Data",
  policies: "Policy Data",
  claims: "Claims Data",
  rewards: "Rewards Data",
  teamMembers: "Team Members Data",
  followups: "Follow-up Data"
};

function detectFileType(headers) {
  const normalized = headers.map(normalizeHeader);
  let bestType = null;
  let bestScore = 0;
  for (const [type, signatures] of Object.entries(TYPE_SIGNATURES)) {
    let score = 0;
    for (const sig of signatures) {
      if (normalized.includes(sig)) score++;
    }
    if (score > bestScore && score >= 2) {
      bestScore = score;
      bestType = type;
    }
  }
  return bestType;
}

// ─── Field definitions per type ─────────────────────────────────────────

const CRM_FIELDS = [
  { key: "name", label: "Full Name", required: true },
  { key: "mobile", label: "Mobile Number", required: true },
  { key: "email", label: "Email", required: false },
  { key: "city", label: "City", required: false },
  { key: "qualification", label: "Qualification", required: false },
  { key: "source", label: "Source", required: false },
  { key: "workflowStage", label: "Recruitment Stage", required: false },
  { key: "nextFollowUp", label: "Follow-up Date", required: false },
  { key: "trainingStatus", label: "Training Status", required: false },
  { key: "examResult", label: "Exam Result", required: false },
  { key: "notes", label: "Notes", required: false }
];

const TYPE_CRM_FIELDS = {
  advisors: CRM_FIELDS,
  leads: CRM_FIELDS,
  followups: CRM_FIELDS,
  clients: [
    { key: "name", label: "Client Name", required: true },
    { key: "clientId", label: "Client ID", required: false },
    { key: "phone", label: "Phone", required: false },
    { key: "email", label: "Email", required: false },
    { key: "policyNumber", label: "Policy Number", required: false },
    { key: "advisorAssigned", label: "Advisor Assigned", required: false },
    { key: "dateReceived", label: "Date Received", required: false },
    { key: "status", label: "Status", required: false },
    { key: "premium", label: "Premium", required: false },
    { key: "city", label: "City", required: false },
    { key: "address", label: "Address", required: false }
  ],
  policies: [
    { key: "policyNumber", label: "Policy Number", required: true },
    { key: "policyType", label: "Policy Type", required: false },
    { key: "sumAssured", label: "Sum Assured", required: false },
    { key: "premium", label: "Premium", required: false },
    { key: "status", label: "Status", required: false },
    { key: "issueDate", label: "Issue Date", required: false },
    { key: "renewalDate", label: "Renewal Date", required: false },
    { key: "clientName", label: "Client Name", required: false },
    { key: "advisor", label: "Advisor", required: false }
  ],
  claims: [
    { key: "claimId", label: "Claim Number", required: true },
    { key: "policyNumber", label: "Policy Number", required: false },
    { key: "amount", label: "Claim Amount", required: false },
    { key: "status", label: "Claim Status", required: false },
    { key: "settlementDate", label: "Settlement Date", required: false },
    { key: "remarks", label: "Remarks", required: false },
    { key: "clientName", label: "Client Name", required: false }
  ],
  rewards: [
    { key: "id", label: "ID", required: false },
    { key: "advisorName", label: "Advisor Name", required: false },
    { key: "advisorCode", label: "Advisor Code", required: false },
    { key: "month", label: "Month", required: false },
    { key: "premiumCollected", label: "Premium Collected", required: false },
    { key: "overridePercent", label: "Override Percent", required: false },
    { key: "overrideEarned", label: "Override Earned", required: false },
    { key: "paymentStatus", label: "Payment Status", required: false },
    { key: "paymentDate", label: "Payment Date", required: false },
    { key: "notes", label: "Notes", required: false }
  ],
  teamMembers: [
    { key: "name", label: "Employee Name", required: true },
    { key: "role", label: "Role", required: false },
    { key: "email", label: "Email", required: false },
    { key: "phone", label: "Phone", required: false },
    { key: "status", label: "Status", required: false }
  ]
};

// ─── Alias maps for auto-mapping ────────────────────────────────────────

const ALIAS_MAP = {
  "full name": "name", "name": "name", "candidate name": "name", "lead name": "name",
  "mobile": "mobile", "mobile number": "mobile", "phone": "mobile", "phone number": "mobile",
  "contact": "mobile", "contact number": "mobile", "mobile no": "mobile", "phone no": "mobile",
  "email": "email", "email address": "email", "e-mail": "email",
  "city": "city", "location": "city", "town": "city",
  "qualification": "qualification", "education": "qualification", "degree": "qualification",
  "educational qualification": "qualification",
  "source": "source", "lead source": "source", "channel": "source", "referred by": "source",
  "recruitment stage": "workflowStage", "stage": "workflowStage", "workflow stage": "workflowStage",
  "pipeline stage": "workflowStage",
  "follow-up date": "nextFollowUp", "followup date": "nextFollowUp", "follow up date": "nextFollowUp",
  "follow-up": "nextFollowUp", "followup": "nextFollowUp", "next follow up": "nextFollowUp",
  "training status": "trainingStatus", "training": "trainingStatus",
  "exam result": "examResult", "exam": "examResult", "result": "examResult",
  "notes": "notes", "remarks": "notes", "comments": "notes", "description": "notes"
};

const TYPE_ALIAS_MAPS = {
  advisors: ALIAS_MAP,
  leads: ALIAS_MAP,
  followups: ALIAS_MAP,
  clients: {
    "client name": "name", "name": "name", "full name": "name",
    "client id": "clientId", "clientid": "clientId",
    "phone": "phone", "mobile": "phone", "mobile number": "phone",
    "email": "email", "email address": "email",
    "policy number": "policyNumber", "policynumber": "policyNumber",
    "advisor assigned": "advisorAssigned", "advisorassigned": "advisorAssigned",
    "advisor": "advisorAssigned",
    "date received": "dateReceived", "datereceived": "dateReceived",
    "enrollment date": "dateReceived",
    "status": "status", "final status": "finalStatus", "finalstatus": "finalStatus",
    "premium": "premium", "premium amount": "premium",
    "city": "city", "address": "address",
    "interest level": "interestLevel", "interestlevel": "interestLevel",
    "lead quality": "leadQuality", "leadquality": "leadQuality",
    "follow-up status": "followUpStatus", "followupstatus": "followUpStatus",
    "next follow-up date": "nextFollowUpDate", "nextfollowupdate": "nextFollowUpDate"
  },
  policies: {
    "policy number": "policyNumber", "policynumber": "policyNumber", "policy #": "policyNumber",
    "policy type": "policyType", "policytype": "policyType", "type": "policyType",
    "sum assured": "sumAssured", "sumassured": "sumAssured", "sum insured": "sumAssured",
    "premium": "premium", "premium amount": "premium",
    "status": "status", "policy status": "status",
    "issue date": "issueDate", "issuedate": "issueDate",
    "renewal date": "renewalDate", "renewaldate": "renewalDate",
    "client name": "clientName", "clientname": "clientName", "client": "clientName",
    "advisor": "advisor", "advisor name": "advisor"
  },
  claims: {
    "claim number": "claimId", "claimid": "claimId", "claim #": "claimId",
    "policy number": "policyNumber", "policynumber": "policyNumber",
    "claim amount": "amount", "amount": "amount",
    "claim status": "status", "status": "status",
    "settlement date": "settlementDate", "settlementdate": "settlementDate",
    "remarks": "remarks", "notes": "remarks",
    "client name": "clientName", "clientname": "clientName"
  },
  rewards: {
    "id": "id", "record id": "recordId", "recordid": "recordId",
    "advisor name": "advisorName", "advisorname": "advisorName",
    "advisor code": "advisorCode", "advisorcode": "advisorCode",
    "month": "month",
    "premium collected": "premiumCollected", "premiumcollected": "premiumCollected",
    "override percent": "overridePercent", "overridepercent": "overridePercent",
    "override earned": "overrideEarned", "overrideearned": "overrideEarned",
    "payment status": "paymentStatus", "paymentstatus": "paymentStatus",
    "payment date": "paymentDate", "paymentdate": "paymentDate",
    "notes": "notes"
  },
  teamMembers: {
    "employee name": "name", "employeename": "name", "name": "name", "full name": "name",
    "team member": "name",
    "role": "role", "designation": "role", "position": "role",
    "email": "email", "email address": "email",
    "phone": "phone", "mobile": "phone", "mobile number": "phone",
    "status": "status", "employee status": "status"
  }
};

// ─── Required fields per type ───────────────────────────────────────────

const TYPE_REQUIRED_FIELDS = {
  advisors: ["name", "mobile"],
  leads: ["name", "mobile"],
  clients: ["name"],
  policies: ["policyNumber"],
  claims: ["claimId"],
  rewards: ["id"],
  followups: ["name"],
  teamMembers: ["name"]
};

// ─── Auto-mapping ──────────────────────────────────────────────────────

function autoMapColumns(headers, type = "advisors") {
  const fields = TYPE_CRM_FIELDS[type] || CRM_FIELDS;
  const aliases = TYPE_ALIAS_MAPS[type] || ALIAS_MAP;
  const mapping = {};
  fields.forEach((f) => { mapping[f.key] = ""; });
  headers.forEach((header) => {
    const normalized = header.toLowerCase().trim();
    const matchedKey = aliases[normalized];
    if (matchedKey && mapping[matchedKey] !== undefined && !mapping[matchedKey]) {
      mapping[matchedKey] = header;
    }
  });
  return mapping;
}

// ─── Row mapping ────────────────────────────────────────────────────────

function mapRow(row, type) {
  const aliases = TYPE_ALIAS_MAPS[type] || ALIAS_MAP;
  const mapped = {};
  Object.keys(row).forEach((header) => {
    const normalized = header.toLowerCase().trim();
    const field = aliases[normalized];
    if (field) {
      mapped[field] = String(row[header] || "").trim();
    }
  });
  return mapped;
}

function validateRequiredFields(headers, type) {
  const required = TYPE_REQUIRED_FIELDS[type] || [];
  const normalizedHeaders = headers.map(normalizeHeader);
  const aliases = TYPE_ALIAS_MAPS[type] || ALIAS_MAP;
  return required.every((field) => {
    return Object.entries(aliases).some(([alias, target]) => {
      return target === field && normalizedHeaders.includes(normalizeHeader(alias));
    });
  });
}

// ─── File parsing (uses xlsx for all formats) ──────────────────────────

async function parseFileContent(blob) {
  const data = new Uint8Array(await blob.arrayBuffer());
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

// ─── Utilities ──────────────────────────────────────────────────────────

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Component ──────────────────────────────────────────────────────────

function ImportDialog({ open, onClose, onImport }) {
  const { importCandidates, addClient, importPolicies, importClaims, importRewards, importFollowups, importTeamMembers, addImportRecord, clearAllCrmData } = useCrm();
  const fileRef = useRef(null);
  const [step, setStep] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [detectedType, setDetectedType] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [zipResults, setZipResults] = useState([]);

  const resetState = useCallback(() => {
    setStep("upload");
    setFileName("");
    setFileSize(0);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setDetectedType(null);
    setImporting(false);
    setResult(null);
    setError("");
    setZipResults([]);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleRemove = useCallback(() => {
    clearAllCrmData();
    resetState();
    onClose();
  }, [clearAllCrmData, resetState, onClose]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "zip") {
      handleZipFile(file);
      return;
    }

    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .zip file.");
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        if (jsonData.length === 0) {
          setError("The file is empty. Please upload a file with data rows.");
          return;
        }
        const hdrs = Object.keys(jsonData[0]);
        if (hdrs.length === 0) {
          setError("No columns found in the file.");
          return;
        }
        const cleanedRows = jsonData.filter((row) => {
          const vals = Object.values(row);
          return vals.some((v) => String(v).trim() !== "");
        });
        if (cleanedRows.length === 0) {
          setError("The file contains no non-empty rows.");
          return;
        }

        const type = detectFileType(hdrs);
        if (!type) {
          setError("Could not determine dataset type from column headers. Please ensure the file contains recognizable column names (e.g., Full Name, Mobile Number, Policy Number, Claim Status, etc.).");
          return;
        }

        setDetectedType(type);
        setHeaders(hdrs);
        setRows(cleanedRows);
        setMapping(autoMapColumns(hdrs, type));
        setStep("map");
      } catch {
        setError("Failed to parse the file. Please check the format and try again.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleZipFile = useCallback(async (file) => {
    setImporting(true);
    setStep("zip-progress");
    setFileName(file.name);
    const results = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const files = Object.keys(zip.files).filter((name) => !zip.files[name].dir);

      if (files.length === 0) {
        setError("The ZIP file contains no files.");
        setImporting(false);
        setStep("upload");
        return;
      }

      for (const filename of files) {
        try {
          const blob = await zip.files[filename].async("blob");
          const ext = filename.split(".").pop().toLowerCase();

          if (!["csv", "xlsx", "xls"].includes(ext)) {
            results.push({ file: filename, type: "—", status: "skipped", message: "Unsupported file type (not CSV/XLSX)", imported: 0, skipped: 0 });
            continue;
          }

          const jsonData = await parseFileContent(blob);

          if (jsonData.length === 0) {
            results.push({ file: filename, type: "—", status: "error", message: "File is empty", imported: 0, skipped: 0 });
            continue;
          }

          const hdrs = Object.keys(jsonData[0]);
          const type = detectFileType(hdrs);

          if (!type) {
            results.push({ file: filename, type: "—", status: "skipped", message: "Could not determine dataset type from column headers", imported: 0, skipped: 0 });
            continue;
          }

          if (!validateRequiredFields(hdrs, type)) {
            const required = TYPE_REQUIRED_FIELDS[type] || [];
            results.push({ file: filename, type: TYPE_LABELS[type], status: "error", message: `Missing required fields: ${required.join(", ")}`, imported: 0, skipped: 0 });
            continue;
          }

          const mappedRows = jsonData
            .filter((row) => Object.values(row).some((v) => String(v).trim() !== ""))
            .map((row) => mapRow(row, type));

          let importResult;
          switch (type) {
            case "advisors":
              mappedRows.forEach((r) => { r.leadType = "Advisor"; });
              importResult = await importCandidates(mappedRows);
              if (importResult && importResult.imported > 0) {
                addImportRecord({ type: "candidates", fileName: filename, count: importResult.imported, id: importResult.importId });
              }
              break;
            case "leads":
              mappedRows.forEach((r) => { r.leadType = r.leadType || "Insurance Customer"; });
              importResult = await importCandidates(mappedRows);
              if (importResult && importResult.imported > 0) {
                addImportRecord({ type: "candidates", fileName: filename, count: importResult.imported, id: importResult.importId });
              }
              break;
            case "followups":
              importResult = await importFollowups(mappedRows);
              if (importResult && importResult.imported > 0) {
                addImportRecord({ type: "candidates", fileName: filename, count: importResult.imported, id: importResult.importId });
              }
              break;
            case "clients":
              for (const row of mappedRows) { await addClient(row); }
              importResult = { imported: mappedRows.length, skipped: 0 };
              break;
            case "policies":
              importResult = await importPolicies(mappedRows);
              break;
            case "claims":
              importResult = await importClaims(mappedRows);
              break;
            case "rewards":
              importResult = await importRewards(mappedRows);
              break;
            case "teamMembers":
              importResult = await importTeamMembers(mappedRows);
              break;
            default:
              results.push({ file: filename, type: "—", status: "skipped", message: "Unknown file type", imported: 0, skipped: 0 });
              continue;
          }

          results.push({
            file: filename,
            type: TYPE_LABELS[type] || type,
            status: "success",
            message: `${importResult.imported} records imported`,
            imported: importResult.imported,
            skipped: importResult.skipped
          });
        } catch (err) {
          results.push({ file: filename, type: "—", status: "error", message: err.message || "Import failed", imported: 0, skipped: 0 });
        }
      }

      setZipResults(results);
      setStep("zip-done");
    } catch (err) {
      setError("Failed to read ZIP file: " + (err.message || "Unknown error"));
      setStep("upload");
    } finally {
      setImporting(false);
    }
  }, [importCandidates, addClient, importPolicies, importClaims, importRewards, importFollowups, importTeamMembers]);

  const currentFields = TYPE_CRM_FIELDS[detectedType] || CRM_FIELDS;
  const requiredFieldsMapped = currentFields.filter((f) => f.required).every((f) => mapping[f.key]);

  const handleImport = useCallback(async () => {
    if (!requiredFieldsMapped) {
      setError("Please map all required fields.");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const records = rows.map((row) => {
        const record = {};
        currentFields.forEach((field) => {
          const csvCol = mapping[field.key];
          if (csvCol) {
            record[field.key] = String(row[csvCol] || "").trim();
          }
        });
        if (record.mobile) record.phone = record.mobile;
        return record;
      });

      let importResult;
      switch (detectedType) {
        case "advisors":
          records.forEach((r) => { r.leadType = "Advisor"; });
          importResult = await importCandidates(records);
          if (importResult && importResult.imported > 0) {
            addImportRecord({ type: "candidates", fileName, count: importResult.imported, id: importResult.importId });
          }
          break;
        case "leads":
          records.forEach((r) => { r.leadType = r.leadType || "Insurance Customer"; });
          importResult = await importCandidates(records);
          if (importResult && importResult.imported > 0) {
            addImportRecord({ type: "candidates", fileName, count: importResult.imported, id: importResult.importId });
          }
          break;
        case "followups":
          importResult = await importFollowups(records);
          if (importResult && importResult.imported > 0) {
            addImportRecord({ type: "candidates", fileName, count: importResult.imported, id: importResult.importId });
          }
          break;
        case "clients":
          for (const row of records) { await addClient(row); }
          importResult = { imported: records.length, skipped: 0 };
          break;
        case "policies":
          importResult = await importPolicies(records);
          break;
        case "claims":
          importResult = await importClaims(records);
          break;
        case "rewards":
          importResult = await importRewards(records);
          break;
        case "teamMembers":
          importResult = await importTeamMembers(records);
          break;
        default:
          throw new Error("Could not determine dataset type.");
      }

      setResult({ imported: importResult.imported, skipped: importResult.skipped, type: detectedType });
      setStep("done");
    } catch (err) {
      setError("Import failed: " + (err.message || "Unknown error"));
      setImporting(false);
    }
  }, [rows, mapping, detectedType, currentFields, requiredFieldsMapped, fileName, importCandidates, addClient, importPolicies, importClaims, importRewards, importFollowups, importTeamMembers, addImportRecord]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {step === "upload" && "Import Data from CSV/Excel/ZIP"}
        {step === "map" && "Map Columns to CRM Fields"}
        {step === "zip-progress" && "Processing ZIP File..."}
        {step === "zip-done" && "ZIP Import Complete"}
        {step === "done" && "Import Complete"}
      </DialogTitle>
      <DialogContent dividers>
        {step === "upload" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.zip"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{
                border: "2px dashed #cbd5e1",
                borderRadius: 3,
                p: 5,
                cursor: "pointer",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: "#2563eb" }
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: "#334155" }}>
                Click to select a file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports .csv, .xlsx, and .zip files
              </Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        )}

        {step === "map" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Chip label={fileName} color="primary" variant="outlined" />
              {detectedType && (
                <Chip label={`Detected: ${TYPE_LABELS[detectedType] || detectedType}`} color="success" variant="outlined" />
              )}
              <Typography variant="body2" color="text.secondary">
                {rows.length} rows found · {headers.length} columns detected
              </Typography>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Auto-mapped columns where possible. Adjust mappings below if needed.
              Required fields are marked with *.
            </Alert>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {currentFields.map((field) => (
                <TextField
                  key={field.key}
                  select
                  fullWidth
                  size="small"
                  label={field.label + (field.required ? " *" : "")}
                  value={mapping[field.key] || ""}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  error={field.required && !mapping[field.key]}
                >
                  <MenuItem value="">
                    <em>-- Not mapped --</em>
                  </MenuItem>
                  {headers.map((h) => (
                    <MenuItem key={h} value={h}>{h}</MenuItem>
                  ))}
                </TextField>
              ))}
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        )}

        {step === "done" && result && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a" }}>{fileName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {fileName.split(".").pop().toUpperCase()}{fileSize ? ` · ${formatFileSize(fileSize)}` : ""}
              </Typography>
              {result.type && (
                <Chip label={`Detected: ${TYPE_LABELS[result.type] || result.type}`} color="success" variant="outlined" sx={{ mt: 1 }} />
              )}
            </Box>
            <Alert severity="success" sx={{ mb: 2, justifyContent: "center" }}>
              ✓ Imported Successfully — {result.imported} record{result.imported !== 1 ? "s" : ""}
              {result.skipped > 0 && ` (${result.skipped} skipped)`}
            </Alert>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleRemove} sx={{ mt: 1 }}>
              Remove
            </Button>
          </Box>
        )}

        {step === "zip-progress" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#334155" }}>Processing {fileName}...</Typography>
            <LinearProgress sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Detecting file types from column headers...
            </Typography>
          </Box>
        )}

        {step === "zip-done" && zipResults.length > 0 && (
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              ZIP import complete. {zipResults.filter((r) => r.status === "success").length} of {zipResults.length} files imported successfully.
            </Alert>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {zipResults.map((r) => (
                <Alert key={r.file} severity={r.status === "success" ? "success" : r.status === "error" ? "error" : "warning"}>
                  <strong>{r.status === "success" ? "✓" : r.status === "error" ? "✗" : "⚠"}</strong> {r.file}
                  {r.type && r.type !== "—" && (
                    <Chip label={r.type} size="small" color="success" variant="outlined" sx={{ ml: 1, height: 20 }} />
                  )}
                  {" — "}{r.message}
                  {r.imported > 0 && ` (${r.imported} records)`}
                  {r.skipped > 0 && ` (${r.skipped} skipped)`}
                </Alert>
              ))}
            </Box>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleRemove}>
                Remove All Imported Data
              </Button>
            </Box>
          </Box>
        )}

        {importing && step === "zip-progress" && <LinearProgress sx={{ mt: 2 }} />}
        {importing && step === "map" && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {step === "done" || step === "zip-done" ? "Close" : "Cancel"}
        </Button>
        {step === "map" && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing || !requiredFieldsMapped}
          >
            {importing ? "Importing..." : `Import ${rows.length} Records`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ImportDialog;
