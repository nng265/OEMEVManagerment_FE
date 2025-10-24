// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
// import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode> // để không bị gọi 2 lần trong dev mode
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </React.StrictMode>
);
// npx json-server --watch db.json --port 3001
