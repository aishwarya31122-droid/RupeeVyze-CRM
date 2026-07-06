import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing-card landing-hero">
        <p className="landing-eyebrow">RupeeVyze</p>
        <h1>RupeeVyze CRM</h1>
        <p className="landing-subtitle">Select a module to continue</p>

        <div className="landing-grid">
          <div className="landing-module-card">
            <div className="landing-icon">👨‍💼</div>
            <h2>Adviser CRM</h2>
            <p>Recruitment and Advisor Management</p>
            <Link className="landing-btn" to="/adviser">
              Open Adviser CRM
            </Link>
          </div>

          <div className="landing-module-card">
            <div className="landing-icon">👥</div>
            <h2>Client CRM</h2>
            <p>Insurance Client Management</p>
            <Link className="landing-btn secondary" to="/client-crm">
              Open Client CRM
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
