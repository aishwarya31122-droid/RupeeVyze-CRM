import { useEffect, useMemo, useState } from "react";
import { useCrm } from "../crmContext.jsx";

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

function OverridePayoutTracker({ performanceRecords = [] }) {
  const { candidates } = useCrm();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortKey, setSortKey] = useState("premium");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    overridePercent: 5,
    paymentStatus: "Pending",
    paymentDate: "",
    notes: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        advisorCode: candidate.advisorCode || `ADV-${String(candidate.id).padStart(3, "0")}`
      }));
  }, [candidates]);

  useEffect(() => {
    const activeCodes = new Set(activeAdvisers.map((adviser) => adviser.advisorCode));

    setRecords((current) => {
      const existingByRecordId = new Map(current.map((record) => [record.recordId, record]));

      return performanceRecords
        .filter((record) => activeCodes.has(record.advisorCode))
        .map((record, index) => {
          const existing = existingByRecordId.get(record.id);
          const overridePercent = existing?.overridePercent ?? 5;

          return {
            id: existing?.id || `PAY-${String(index + 1).padStart(3, "0")}`,
            recordId: record.id,
            advisorName: record.advisorName,
            advisorCode: record.advisorCode,
            month: record.month,
            premiumCollected: Number(record.premiumCollected || 0),
            overridePercent,
            overrideEarned: Number(record.premiumCollected || 0) * (overridePercent / 100),
            paymentStatus: existing?.paymentStatus ?? "Pending",
            paymentDate: existing?.paymentDate ?? "",
            notes: existing?.notes ?? ""
          };
        });
    });
  }, [activeAdvisers, performanceRecords]);

  const summary = useMemo(() => {
    const totalOverride = records.reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);
    const totalPaid = records.filter((record) => record.paymentStatus === "Paid").reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);
    const totalPending = records.filter((record) => record.paymentStatus === "Pending").reduce((sum, record) => sum + Number(record.overrideEarned || 0), 0);
    const outstanding = totalPending;
    const paidCount = records.filter((record) => record.paymentStatus === "Paid").length;

    return {
      totalOverride,
      totalPaid,
      totalPending,
      outstanding,
      paidCount
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    let result = records.filter((record) => {
      const matchesSearch = !normalizedSearch || record.advisorName.toLowerCase().includes(normalizedSearch);
      const matchesMonth = selectedMonth === "All" || record.month === selectedMonth;
      const matchesStatus = selectedStatus === "All" || record.paymentStatus === selectedStatus;
      return matchesSearch && matchesMonth && matchesStatus;
    });

    if (sortKey === "premium") {
      result = [...result].sort((a, b) => b.premiumCollected - a.premiumCollected);
    }

    if (sortKey === "override") {
      result = [...result].sort((a, b) => b.overrideEarned - a.overrideEarned);
    }

    if (sortKey === "month") {
      result = [...result].sort((a, b) => a.month.localeCompare(b.month));
    }

    return result;
  }, [records, searchTerm, selectedMonth, selectedStatus, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const monthOptions = ["All", ...Array.from(new Set(records.map((record) => record.month).filter(Boolean)))];

  const openEditModal = (record) => {
    setEditingId(record.id);
    setFormData({
      overridePercent: record.overridePercent,
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate || "",
      notes: record.notes || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({ overridePercent: 5, paymentStatus: "Pending", paymentDate: "", notes: "" });
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!editingId) return;

    const nextValue = Number(formData.overridePercent || 0);
    setRecords((current) =>
      current.map((record) =>
        record.id === editingId
          ? {
              ...record,
              overridePercent: nextValue,
              overrideEarned: Number(record.premiumCollected || 0) * (nextValue / 100),
              paymentStatus: formData.paymentStatus,
              paymentDate: formData.paymentStatus === "Paid" ? formData.paymentDate : "",
              notes: formData.notes
            }
          : record
      )
    );
    closeModal();
  };

  const handleDelete = (id) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  return (
    <div>
      <style>{`
        .override-table-wrap {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow: 0 12px 36px rgba(15,23,42,0.04);
          overflow: hidden;
        }
        .override-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }
        .override-table th,
        .override-table td {
          text-align: left;
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .override-table thead th {
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
        }
        .override-table tbody tr:hover {
          background: #f8fafc;
        }
        .override-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .override-summary-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(226,232,240,0.9);
          box-shadow: 0 12px 36px rgba(15,23,42,0.04);
          padding: 18px;
        }
        .override-summary-card h3 {
          margin: 0 0 8px;
          font-size: 0.95rem;
          color: var(--muted, #475569);
        }
        .override-summary-card strong {
          font-size: 1.25rem;
          color: #111827;
        }
        .override-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .override-toolbar .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          flex: 1;
        }
        .override-toolbar .controls input,
        .override-toolbar .controls select {
          max-width: 220px;
        }
        .override-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 50;
        }
        .override-modal {
          width: min(700px, 100%);
          background: #fff;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.2);
        }
        .override-modal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .override-modal-grid .full {
          grid-column: 1 / -1;
        }
        @media (max-width: 768px) {
          .override-modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header">
        <div>
          <h1>Override & Payout Tracker</h1>
          <p>Track override earnings and payout status for activated advisers.</p>
        </div>
      </div>

      <div className="override-summary-grid">
        <div className="override-summary-card">
          <h3>Total Override Earned</h3>
          <strong>{formatCurrency(summary.totalOverride)}</strong>
        </div>
        <div className="override-summary-card">
          <h3>Total Paid</h3>
          <strong>{formatCurrency(summary.totalPaid)}</strong>
        </div>
        <div className="override-summary-card">
          <h3>Total Pending</h3>
          <strong>{formatCurrency(summary.totalPending)}</strong>
        </div>
        <div className="override-summary-card">
          <h3>Total Outstanding Amount</h3>
          <strong>{formatCurrency(summary.outstanding)}</strong>
        </div>
        <div className="override-summary-card">
          <h3>Number of Paid Records</h3>
          <strong>{summary.paidCount}</strong>
        </div>
      </div>

      <div className="override-toolbar">
        <div className="controls">
          <input
            type="text"
            placeholder="Search advisor name"
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
          <select value={selectedStatus} onChange={(event) => { setSelectedStatus(event.target.value); setPage(1); }}>
            <option value="All">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="premium">Sort by Premium Collected</option>
            <option value="override">Sort by Override Earned</option>
            <option value="month">Sort by Month</option>
          </select>
        </div>
      </div>

      <div className="override-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="override-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Advisor Name</th>
                <th>Month</th>
                <th>Premium Collected (₹)</th>
                <th>Your Override %</th>
                <th>Override Earned (₹)</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.advisorName}</td>
                  <td>{formatMonth(record.month)}</td>
                  <td>{formatCurrency(record.premiumCollected)}</td>
                  <td>{record.overridePercent}%</td>
                  <td>{formatCurrency(record.overrideEarned)}</td>
                  <td>{record.paymentStatus}</td>
                  <td>{record.paymentDate || ""}</td>
                  <td>{record.notes}</td>
                  <td>
                    <button className="secondary" type="button" onClick={() => openEditModal(record)}>
                      Edit
                    </button>
                    <button className="danger" type="button" onClick={() => handleDelete(record.id)} style={{ background: "#fee2e2", color: "#b91c1c" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length > pageSize && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button className="secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button key={pageNumber} className={pageNumber === page ? "primary" : "secondary"} type="button" onClick={() => setPage(pageNumber)}>
              {pageNumber}
            </button>
          ))}
          <button className="secondary" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="override-modal-overlay" onClick={closeModal}>
          <div className="override-modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: "16px", padding: "16px 20px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Edit Override Record</h2>
                <p style={{ margin: "6px 0 0" }}>Adjust payout details while the linked adviser data remains read-only.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="override-modal-grid">
                <div>
                  <label htmlFor="overridePercent">Your Override %</label>
                  <input id="overridePercent" name="overridePercent" type="number" min="0" step="0.1" value={formData.overridePercent} onChange={handleFormChange} required />
                </div>
                <div>
                  <label htmlFor="paymentStatus">Payment Status</label>
                  <select id="paymentStatus" name="paymentStatus" value={formData.paymentStatus} onChange={handleFormChange}>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="paymentDate">Payment Date</label>
                  <input id="paymentDate" name="paymentDate" type="date" value={formData.paymentDate} onChange={handleFormChange} disabled={formData.paymentStatus !== "Paid"} />
                </div>
                <div className="full">
                  <label htmlFor="notes">Notes</label>
                  <textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} />
                </div>
              </div>

              <div className="modal-actions" style={{ justifyContent: "flex-end", marginTop: "20px" }}>
                <button className="secondary" type="button" onClick={closeModal}>Cancel</button>
                <button className="primary" type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverridePayoutTracker;
