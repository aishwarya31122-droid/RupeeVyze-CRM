import { Link } from "react-router-dom";

function Layout({ children }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Recruitment CRM</h2>

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/pipeline">Recruitment Pipeline</Link>
          <Link to="/followups">Follow-up Tracker</Link>
          <Link to="/reports">Reports & Analytics</Link>
          <Link to="/team">Team Members</Link>
          <Link to="/details">Details</Link>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;