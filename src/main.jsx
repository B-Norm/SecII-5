import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-auth-kit";
import "./interceptors/axios";

import Dashboard from "./dashboard/Dashboard";
import { RouteComponent } from "./routes/Routes";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>

  <AuthProvider
    authType="cookie"
    authName="_auth"
    cookieDomain={window.location.hostname}
    cookieSecure={false}
  >
    <RouteComponent />
  </AuthProvider>
  // </React.StrictMode>
);
