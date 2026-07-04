import { useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";

const defaultForm = (adviser) => ({
  advisorName: adviser?.name || "",
  advisorCode: adviser?.advisorCode || "",
  month: "",
  policiesSold: "",
  premiumCollected: "",
  persistency: "",
  monthlyTarget: "",
  remarks: ""
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

const formatMonth = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric"
  }).format(date);
};

function PerformanceTracker({ performanceRecords, onPerformanceRecordsChange }) {
  const { candidates } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [sortKey, setSortKey] = useState("premium");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAdviser, setActiveAdviser] = useState(null);
  const [formData, setFormData] = useState(defaultForm(null));

  const pageSize = 10;

  const activeAdvisers = useMemo(() => {
    return candidates
      .filter((candidate) => {
        const status = (candidate.adviserStatus || "").toLowerCase();
        const stage = (candidate.stage || "").toLowerCase();
        return status === "active" || status === "activated" || stage === "active" || stage === "activated";
      })
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        advisorCode: candidate.advisorCode || `ADV-${String(candidate.id).padStart(3, "0")}`,
        stage: candidate.stage,
        adviserStatus: candidate.adviserStatus
      }));
  }, [candidates]);

  const adviserRows = useMemo(() => {
    return activeAdvisers.map((adviser) => {
      const record = performanceRecords.find((item) => item.advisorCode === adviser.advisorCode);
      return {
        ...adviser,
        recordId: record?.id || "",
        performance: record || null
      };
    });
  }, [activeAdvisers, performanceRecords]);

  const summary = useMemo(() => {
    const entries = performanceRecords;
    const totalPolicies = entries.reduce((sum, record) => sum + Number(record?.policiesSold || 0), 0);
    const totalPremium = entries.reduce((sum, record) => sum + Number(record?.premiumCollected || 0), 0);
    const averagePersistency = entries.length
      ? entries.reduce((sum, record) => sum + Number(record?.persistency || 0), 0) / entries.length
      : 0;
    const averageAchievement = entries.length
      ? entries.reduce((sum, record) => sum + getAchievement(record || {}), 0) / entries.length
      : 0;

    return {
      activeAdvisers: adviserRows.length,
      totalPolicies,
      totalPremium,
      averagePersistency,
      averageAchievement
    };
  }, [adviserRows, performanceRecords]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = adviserRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        row.name.toLowerCase().includes(normalizedSearch) ||
        row.advisorCode.toLowerCase().includes(normalizedSearch);
      const matchesMonth = selectedMonth === "All" || (row.performance?.month || "") === selectedMonth;
      return matchesSearch && matchesMonth;
    });

    if (sortKey === "premium") {
      result = [...result].sort((a, b) => Number(b.performance?.premiumCollected || 0) - Number(a.performance?.premiumCollected || 0));
    }

    if (sortKey === "policies") {
      result = [...result].sort((a, b) => Number(b.performance?.policiesSold || 0) - Number(a.performance?.policiesSold || 0));
    }

    if (sortKey === "achievement") {
      result = [...result].sort((a, b) => getAchievement(b.performance || {}) - getAchievement(a.performance || {}));
    }

    return result;
  }, [adviserRows, searchTerm, selectedMonth, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const monthOptions = ["All", ...Array.from(new Set(performanceRecords.map((record) => record.month).filter(Boolean)))];

  const openUpdateModal = (adviser) => {
    const currentRecord = performanceRecords.find((record) => record.advisorCode === adviser.advisorCode);
    setActiveAdviser(adviser);
    setFormData(
      currentRecord
        ? {
            advisorName: currentRecord.advisorName,
            advisorCode: currentRecord.advisorCode,
            month: currentRecord.month,
            policiesSold: currentRecord.policiesSold,
            premiumCollected: currentRecord.premiumCollected,
            persistency: currentRecord.persistency,
            monthlyTarget: currentRecord.monthlyTarget,
            remarks: currentRecord.remarks
          }
        : defaultForm(adviser)
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveAdviser(null);
    setFormData(defaultForm(null));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activeAdviser) return;

    const payload = {
      id: performanceRecords.find((record) => record.advisorCode === activeAdviser.advisorCode)?.id || `PERF-${String(performanceRecords.length + 1).padStart(3, "0")}`,
      adviserId: activeAdviser.id,
      advisorName: activeAdviser.name,
      advisorCode: activeAdviser.advisorCode,
      month: formData.month,
      policiesSold: Number(formData.policiesSold || 0),
      premiumCollected: Number(formData.premiumCollected || 0),
      persistency: Number(formData.persistency || 0),
      monthlyTarget: Number(formData.monthlyTarget || 0),
      remarks: formData.remarks
    };

    onPerformanceRecordsChange((current) => {
      const existingIndex = current.findIndex((record) => record.advisorCode === activeAdviser.advisorCode);
      if (existingIndex >= 0) {
        return current.map((record, index) => (index === existingIndex ? payload : record));
      }
      return [...current, payload];
    });
    closeModal();
    setPage(1);
  };

  const handleDelete = (adviserCode) => {
    onPerformanceRecordsChange((current) => current.filter((record) => record.advisorCode !== adviserCode));
  };

  return (
    <div>
      <style>{`
        .performance-table-wrap {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow: 0 12px 36px rgba(15,23,42,0.04);
          overflow: hidden;
        }
        .performance-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1120px;
        }
        .performance-table th,
        .performance-table td {
          text-align: left;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .performance-table thead th {
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }
        .performance-table tbody tr:hover {
          background: #f8fafc;
        }
        .performance-table-actions button {
          margin-right: 8px;
        }
        .performance-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .performance-summary-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow: 0 12px 36px rgba(15,23,42,0.04);
          padding: 18px;
        }
        .performance-summary-card h3 {
          margin: 0 0 8px;
          font-size: 0.95rem;
          color: var(--muted, #475569);
        }
        .performance-summary-card strong {
          font-size: 1.25rem;
          color: #111827;
        }
        .performance-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          align-items: center;
          justify-content: space-between;
        }
        .performance-toolbar .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          flex: 1;
        }
        .performance-toolbar .controls input,
        .performance-toolbar .controls select {
          max-width: 220px;
        }
        .performance-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 50;
        }
        .performance-modal {
          width: min(720px, 100%);
          background: #fff;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
        }
        .performance-modal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .performance-modal-grid .full {
          grid-column: 1 / -1;
        }
        .performance-achievement {
          padding: 12px 14px;
          border-radius: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .performance-modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1>Performance Tracker</h1>
          <p>Track monthly production and business performance of activated advisers.</p>
        </div>
      </div>

      <div className="performance-summary-grid">
        <div className="performance-summary-card">
          <h3>Total Activated Advisers</h3>
          <strong>{summary.activeAdvisers}</strong>
        </div>
        <div className="performance-summary-card">
          <h3>Total Policies Sold</h3>
          <strong>{summary.totalPolicies}</strong>
        </div>
        <div className="performance-summary-card">
          <h3>Total Premium Collected</h3>
          <strong>{formatCurrency(summary.totalPremium)}</strong>
        </div>
        <div className="performance-summary-card">
          <h3>Average Persistency %</h3>
          <strong>{summary.averagePersistency.toFixed(1)}%</strong>
        </div>
        <div className="performance-summary-card">
          <h3>Average Achievement %</h3>
          <strong>{summary.averageAchievement.toFixed(1)}%</strong>
        </div>
      </div>

      <div className="performance-toolbar">
        <div className="controls">
          <input
            type="text"
            placeholder="Search advisor name or code"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
          />
          <select value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setPage(1); }}>
            {monthOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All months" : formatMonth(option)}
              </option>
            ))}
          </select>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="premium">Sort by Premium Collected</option>
            <option value="policies">Sort by Policies Sold</option>
            <option value="achievement">Sort by Achievement %</option>
          </select>
        </div>
      </div>

      <div className="performance-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="performance-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Advisor Name</th>
                <th>TATA AIA Advisor Code</th>
                <th>Month</th>
                <th>Policies Sold</th>
                <th>Premium Collected (₹)</th>
                <th>Persistency %</th>
                <th>Monthly Target (₹)</th>
                <th>Achievement %</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.recordId || ""}</td>
                  <td>{row.name}</td>
                  <td>{row.advisorCode}</td>
                  <td>{formatMonth(row.performance?.month)}</td>
                  <td>{row.performance?.policiesSold ?? ""}</td>
                  <td>{row.performance ? formatCurrency(row.performance.premiumCollected) : ""}</td>
                  <td>{row.performance ? `${row.performance.persistency}%` : ""}</td>
                  <td>{row.performance ? formatCurrency(row.performance.monthlyTarget) : ""}</td>
                  <td>{row.performance ? `${getAchievement(row.performance).toFixed(1)}%` : ""}</td>
                  <td>{row.performance?.remarks || ""}</td>
                  <td className="performance-table-actions">
                    <button className="secondary" type="button" onClick={() => openUpdateModal(row)}>
                      Update Performance
                    </button>
                    {row.performance && (
                      <button className="danger" type="button" onClick={() => handleDelete(row.advisorCode)} style={{ background: "#fee2e2", color: "#b91c1c" }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRows.length > pageSize && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button className="secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              className={pageNumber === page ? "primary" : "secondary"}
              type="button"
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button className="secondary" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Next
          </button>
        </div>
      )}

      {isModalOpen && activeAdviser && (
        <div className="performance-modal-overlay" onClick={closeModal}>
          <div className="performance-modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: "16px", padding: "16px 20px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Update Performance</h2>
                <p style={{ margin: "6px 0 0" }}>Capture adviser performance details and auto-calculate achievement.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="performance-modal-grid">
                <div>
                  <label htmlFor="advisorName">Advisor Name</label>
                  <input id="advisorName" name="advisorName" value={formData.advisorName} readOnly required />
                </div>
                <div>
                  <label htmlFor="advisorCode">Advisor Code</label>
                  <input id="advisorCode" name="advisorCode" value={formData.advisorCode} readOnly required />
                </div>
                <div>
                  <label htmlFor="month">Month</label>
                  <input id="month" name="month" type="month" value={formData.month} onChange={handleFormChange} required />
                </div>
                <div>
                  <label htmlFor="policiesSold">Policies Sold</label>
                  <input id="policiesSold" name="policiesSold" type="number" min="0" value={formData.policiesSold} onChange={handleFormChange} required />
                </div>
                <div>
                  <label htmlFor="premiumCollected">Premium Collected (₹)</label>
                  <input id="premiumCollected" name="premiumCollected" type="number" min="0" value={formData.premiumCollected} onChange={handleFormChange} required />
                </div>
                <div>
                  <label htmlFor="persistency">Persistency %</label>
                  <input id="persistency" name="persistency" type="number" min="0" max="100" value={formData.persistency} onChange={handleFormChange} required />
                </div>
                <div>
                  <label htmlFor="monthlyTarget">Monthly Target (₹)</label>
                  <input id="monthlyTarget" name="monthlyTarget" type="number" min="0" value={formData.monthlyTarget} onChange={handleFormChange} required />
                </div>
                <div className="performance-achievement">
                  <div>Achievement %</div>
                  <div style={{ fontSize: "1.1rem", marginTop: "4px" }}>
                    {getAchievement({ premiumCollected: Number(formData.premiumCollected || 0), monthlyTarget: Number(formData.monthlyTarget || 0) }).toFixed(1)}%
                  </div>
                </div>
                <div className="full">
                  <label htmlFor="remarks">Remarks</label>
                  <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleFormChange} placeholder="Add notes for the month" />
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="secondary" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="primary" type="submit">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getAchievement(record) {
  const premium = Number(record?.premiumCollected || 0);
  const target = Number(record?.monthlyTarget || 0);
  if (!target) return 0;
  return (premium / target) * 100;
}

export default PerformanceTracker;
