import React from "react";

export default function BIDashboard() {
  return (
    <div>
      <h3>BI Dashboard</h3>
      <p>High-level KPIs: Policies Issued, Premium Collected, Renewals Due, Claims Ratio.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <div className="kpi">Policies Issued<br /><strong>124</strong></div>
        <div className="kpi">Premium Collected<br /><strong>₹ 12,40,000</strong></div>
        <div className="kpi">Renewals Due<br /><strong>32</strong></div>
        <div className="kpi">Claims Ratio<br /><strong>4.2%</strong></div>
      </div>
    </div>
  );
}
