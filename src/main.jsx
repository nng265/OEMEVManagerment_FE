// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css"; // <-- IMPORT GLOBAL CSS
import "react-toastify/dist/ReactToastify.css"; // <-- IMPORT TOASTIFY CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode> // Uncomment if needed, but causes double renders in dev
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </React.StrictMode>
);
