import React from "react";
import ReactDOM from "react-dom/client";
import Jess from "./jess/Jess.jsx";
import "./theme.css";
import "./styles.css";

// /      → laptop homepage with Jess's QR code
// /jess  → Jess Mode
// /kyd   → Control Room (loaded separately so none of it ships with Jess's page)
const path = window.location.pathname.replace(/\/+$/, "");
const isKyd = path.startsWith("/kyd");
const isHome = path === "";
const root = ReactDOM.createRoot(document.getElementById("root"));

if (isHome) {
  import("./home/Home.jsx").then(({ default: Home }) =>
    root.render(
      <React.StrictMode>
        <Home />
      </React.StrictMode>
    )
  );
} else if (isKyd) {
  document.title = "Control Room";
  import("./kyd/Kyd.jsx").then(({ default: Kyd }) =>
    root.render(
      <React.StrictMode>
        <Kyd />
      </React.StrictMode>
    )
  );
} else {
  root.render(
    <React.StrictMode>
      <Jess />
    </React.StrictMode>
  );
}
