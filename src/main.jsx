import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./theme.css";
import "./styles.css";
import { readSharedPlan } from "./lib/share.js";
import { savePlan } from "./lib/storage.js";

// Opened from Jess's QR code: pick up any Host Mode edits packed into the link.
const shared = readSharedPlan();
if (shared) savePlan(shared);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
