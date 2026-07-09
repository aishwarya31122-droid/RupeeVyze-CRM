import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { initialClientLeads } from "../../data/clientCrmData";

const COLORS = ["#2563eb", "#f59e0b", "#7c3aed", "#16a34a", "#dc2626"];

function ReportsAnalytics({ leads = initialClientLeads }) {
  const leadSourceData = [
    { name: "Website", value: leads.filter((lead) => lead.leadSource === "Website").length },
    { name: "Referral", value: leads.filter((lead) => lead.leadSource === "Referral").length },
    { name: "Social Media", value: leads.filter((lead) => lead.leadSource === "Social Media").length },
    { name: "Partner Channel", value: leads.filter((lead) => lead.leadSource === "Partner Channel").length },
    { name: "Call Center", value: leads.filter((lead) => lead.leadSource === "Call Center").length }
  ];

  const qualityData = [
    { name: "Hot", value: leads.filter((lead) => lead.leadQuality === "Hot").length },
    { name: "Warm", value: leads.filter((lead) => lead.leadQuality === "Warm").length },
    { name: "Cold", value: leads.filter((lead) => lead.leadQuality === "Cold").length }
  ];

  const policyData = [
    { name: "Term Insurance", value: leads.filter((lead) => lead.policyTypeInterest === "Term Insurance").length },
    { name: "ULIP", value: leads.filter((lead) => lead.policyTypeInterest === "ULIP").length },
    { name: "Health Insurance", value: leads.filter((lead) => lead.policyTypeInterest === "Health Insurance").length },
    { name: "Retirement Plan", value: leads.filter((lead) => lead.policyTypeInterest === "Retirement Plan").length },
    { name: "Child Plan", value: leads.filter((lead) => lead.policyTypeInterest === "Child Plan").length },
    { name: "Savings Plan", value: leads.filter((lead) => lead.policyTypeInterest === "Savings Plan").length }
  ];

  const funnelData = [
    { name: "Lead Received", value: leads.length },
    { name: "Qualified", value: Math.round(leads.length * 0.8) },
    { name: "First Call", value: Math.round(leads.length * 0.7) },
    { name: "Needs Analysis", value: Math.round(leads.length * 0.6) },
    { name: "Proposal Sent", value: leads.filter((lead) => lead.proposalSent).length },
    { name: "KYC Started", value: leads.filter((lead) => lead.kycStarted).length },
    { name: "Policy Issued", value: leads.filter((lead) => lead.policyIssued).length },
    { name: "Converted", value: leads.filter((lead) => lead.finalStatus === "Converted").length }
  ];

  const monthlyLeadTrend = [
    { month: "Apr", leads: 4 },
    { month: "May", leads: 6 },
    { month: "Jun", leads: 8 },
    { month: "Jul", leads: 7 }
  ];

  const monthlyConversionTrend = [
    { month: "Apr", conversions: 1 },
    { month: "May", conversions: 2 },
    { month: "Jun", conversions: 3 },
    { month: "Jul", conversions: 2 }
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Use analytics to gauge lead quality, conversion health, and advisor performance.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="kpi-card" style={{ borderLeftColor: "#2563eb" }}>
          <p>Lead Source Analysis</p>
          <h2>{leads.length}</h2>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: "#7c3aed" }}>
          <p>Proposal Sent</p>
          <h2>{leads.filter((lead) => lead.proposalSent).length}</h2>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: "#16a34a" }}>
          <p>Policy Issued</p>
          <h2>{leads.filter((lead) => lead.policyIssued).length}</h2>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: "#dc2626" }}>
          <p>Converted</p>
          <h2>{leads.filter((lead) => lead.finalStatus === "Converted").length}</h2>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <h3>Lead Source Analysis</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={leadSourceData} dataKey="value" nameKey="name" outerRadius={80}>
                {leadSourceData.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Lead Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <h3>Policy Type Interest</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={policyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-grid card-grid-2">
        <div className="card">
          <h3>Monthly Lead Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyLeadTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Monthly Conversion Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyConversionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="conversions" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalytics;
