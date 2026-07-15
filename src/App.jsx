import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard/index.jsx";
import LeadManagementModule from "./pages/lead-management/LeadManagementModule.jsx";
import AdvisorOperationsModule from "./pages/advisor-operations/AdvisorOperationsModule.jsx";
import ClientOperationsModule from "./pages/client-operations/ClientOperationsModule.jsx";
import BusinessIntModule from "./pages/business-intelligence/BusinessIntModule.jsx";
import AdminModule from "./pages/administration/AdminModule.jsx";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/adviser/dashboard" replace />} />
          <Route path="/adviser/dashboard" element={<Dashboard />} />
          <Route path="/adviser/lead-management/*" element={<LeadManagementModule />} />
          <Route path="/adviser/advisor-operations/*" element={<AdvisorOperationsModule />} />
          <Route path="/adviser/client-operations/*" element={<ClientOperationsModule />} />
          <Route path="/adviser/business-intelligence/*" element={<BusinessIntModule />} />
          <Route path="/adviser/administration/*" element={<AdminModule />} />
          <Route path="*" element={<Navigate to="/adviser/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
