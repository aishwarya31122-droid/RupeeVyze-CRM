import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard/index.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import CandidateDetails from "./pages/CandidateDetails.jsx";
import FollowUpTracker from "./pages/FollowUpTracker.jsx";
import Reports from "./pages/Reports.jsx";
import Details from "./pages/Details.jsx";
import TeamMembers from "./pages/TeamMembers.jsx";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/candidate/:id" element={<CandidateDetails />} />
          <Route path="/followups" element={<FollowUpTracker />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/details" element={<Details />} />
          <Route path="/team" element={<TeamMembers />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;