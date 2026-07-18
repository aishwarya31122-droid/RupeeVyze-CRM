import { useCrm } from "../crmContext.jsx";

function Details() {
  const { settings } = useCrm();

  const fields = [
    { label: "Company / Brand Name", value: settings.businessName || "—" },
    { label: "Contact Email", value: settings.contactEmail || "—" },
    { label: "Follow-up Reminder Days", value: settings.followUpReminderDays || "—" },
    { label: "Configuration", value: settings.selectedConfigId || "—" }
  ];

  return (
    <div className="details-page">
      <h1>Details</h1>
      
      <section className="business-details-section">
        <div className="section-header">
          <h2>Business Details</h2>
          <p className="section-subtitle">View your distribution business details.</p>
        </div>

        <div className="details-grid">
          {fields.map((field) => (
            <div className="detail-card" key={field.label}>
              <label className="detail-label">{field.label}</label>
              <p className="detail-value">{field.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Details;
