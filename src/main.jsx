import React from "react";
import ReactDOM from "react-dom/client";
import Jess from "./jess/Jess.jsx";
import "./theme.css";
import "./styles.css";

// /kyd → Control Room (loaded separately so none of it ships with Jess's page).
// Everything else (/jess, /) → Jess Mode.
const isKyd = window.location.pathname.replace(/\/+$/, "").startsWith("/kyd");
const root = ReactDOM.createRoot(document.getElementById("root"));

if (isKyd) {
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
