// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css"; // <-- IMPORT GLOBAL CSS
import "react-toastify/dist/ReactToastify.css"; // <-- IMPORT TOASTIFY CSS
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode> // Uncomment if needed, but causes double renders in dev
  <BrowserRouter>
    <GoogleOAuthProvider clientId="525329839801-4iecu1eqrfi8671t9lf8ah1dema555ds.apps.googleusercontent.com"> {/* TODO: Move to env variable */}
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
