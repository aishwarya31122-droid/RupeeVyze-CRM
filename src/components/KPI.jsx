export default function KPI({ title, value, accent = "#2563eb" }) {
  return (
    <div className="kpi-card" style={{ borderColor: accent }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
