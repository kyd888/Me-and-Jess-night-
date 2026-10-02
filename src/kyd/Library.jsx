import { useState } from "react";

/** The full card library, by category. Only on Kyd's phone. */
export default function Library({ state, categories, busy, onToggle, onEdit, onAdd }) {
  const [cat, setCat] = useState(Object.keys(categories)[0]);
  const done = new Set(state.rounds.map((r) => r.planId));
  const list = state.plans.filter((p) => p.category === cat);
  return (
    <details className="k-card">
      <summary className="k-summary">Card library ({state.plans.filter((p) => p.enabled !== false).length} plans)</summary>
      <div className="k-tabs" style={{ marginTop: 12 }}>
        {Object.keys(categories).map((c) => (
          <button key={c} className={`k-tab ${c === cat ? "is-on" : ""}`} onClick={() => setCat(c)}>
            {categories[c].icon} {c}
          </button>
        ))}
      </div>
      <ul className="k-plan">
        {list.map((p) => (
          <li key={p.id} className={`k-step ${p.enabled === false ? "is-done" : ""}`}>
            <div className="k-step-main" onClick={() => onEdit(p)}>
              <span className="k-step-n">{done.has(p.id) ? "✓" : p.icon}</span>
              <span>
                <strong>{p.name}</strong>
                <span className="k-muted small block">
                  {p.revealMode} · ~{p.duration}m · {p.cost}
                  {p.closesAt ? ` · closes ${p.closesAt}` : ""}
                </span>
              </span>
            </div>
            <button className="k-mini" disabled={busy} onClick={() => onToggle(p)}>
              {p.enabled === false ? "off" : "on"}
            </button>
          </li>
        ))}
      </ul>
      <button className="k-btn wide" onClick={onAdd}>+ Add a plan</button>
      <p className="k-muted small">"off" = never dealt tonight (closed, not in the mood). Tap a plan to edit it.</p>
    </details>
  );
}
