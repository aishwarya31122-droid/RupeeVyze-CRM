import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CrmProvider } from "./crmContext.jsx";
import { AuthProvider } from "./authContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CrmProvider>
        <App />
      </CrmProvider>
    </AuthProvider>
  </React.StrictMode>
);