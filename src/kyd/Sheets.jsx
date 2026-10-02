import { useState } from "react";

export function Sheet({ title, onClose, children }) {
  return (
    <div className="k-sheet-backdrop" onClick={onClose}>
      <div className="k-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="k-row">
          <p className="k-title">{title}</p>
          <button className="k-icon" onClick={onClose} aria-label="close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Message / clue composer with one-tap presets. */
export function TextSheet({ title, note, presets, onSend, onClose }) {
  const [text, setText] = useState("");
  return (
    <Sheet title={title} onClose={onClose}>
      <p className="k-muted small">{note}</p>
      <div className="k-chips">
        {presets.map((p) => (
          <button key={p} className="k-chip" onClick={() => onSend(p)}>{p}</button>
        ))}
      </div>
      <textarea className="k-input" rows={2} placeholder="or type your own…" value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />
      <button className="k-btn k-primary wide" disabled={!text.trim()} onClick={() => onSend(text.trim())}>Send</button>
    </Sheet>
  );
}

/** CHOOSE CATEGORY MYSELF: every category, with why the engine would skip it. */
export function CategorySheet({ options, title = "Choose category", onPick, onClose }) {
  return (
    <Sheet title={title} onClose={onClose}>
      <p className="k-muted small">Jess never sees this. Greyed out = the engine would skip it, but you can still force it.</p>
      <div className="k-col">
        {options.map((o) => (
          <button
            key={o.id}
            className={`k-cat ${o.eligible ? "" : "is-off"}`}
            disabled={o.available === 0}
            onClick={() => (o.eligible || window.confirm(`${o.reason}. Use it anyway?`)) && onPick(o.id)}
          >
            <span className="k-cat-icon">{o.icon}</span>
            <span>
              <strong>{o.id}</strong> <span className="k-muted">“{o.label}”</span>
              <span className="k-muted small block">
                {o.available} open option{o.available === 1 ? "" : "s"}
                {o.reason ? ` · ${o.reason}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/** Pick a specific plan from the private library (for CHANGE PLAN / requests). */
export function PlanPickerSheet({ state, categories, startCategory, suggested, actionLabel, onPick, onClose }) {
  const cats = Object.keys(categories);
  const [cat, setCat] = useState(suggested?.length ? "SUGGESTED" : startCategory || cats[0]);
  const done = new Set(state.rounds.map((r) => r.planId));
  const list = cat === "SUGGESTED" ? suggested.map((id) => state.plans.find((p) => p.id === id)).filter(Boolean) : state.plans.filter((p) => p.category === cat);
  return (
    <Sheet title="Change plan" onClose={onClose}>
      <div className="k-tabs">
        {suggested?.length > 0 && (
          <button className={`k-tab ${cat === "SUGGESTED" ? "is-on" : ""}`} onClick={() => setCat("SUGGESTED")}>SUGGESTED</button>
        )}
        {cats.map((c) => (
          <button key={c} className={`k-tab ${c === cat ? "is-on" : ""}`} onClick={() => setCat(c)}>
            {categories[c].icon} {c}
          </button>
        ))}
      </div>
      <div className="k-backups">
        {list.map((p) => (
          <div key={p.id} className={`k-backup ${p.enabled === false ? "is-off" : ""}`}>
            <p className="k-title">
              {p.icon} {p.name} {done.has(p.id) && <span className="k-tag">done</span>}
            </p>
            <p className="k-muted">{p.place} · ~{p.duration} min · {p.cost}{p.closesAt ? ` · closes ${p.closesAt}` : ""}</p>
            {p.hostNotes && <p className="k-note">{p.hostNotes}</p>}
            <button className="k-btn k-primary" onClick={() => onPick(p.id)}>{actionLabel}</button>
          </div>
        ))}
      </div>
      <p className="k-muted small">Nothing changes on her phone except "plot twist 😭". The new place stays secret until you tap REVEAL.</p>
    </Sheet>
  );
}

const REVEAL_MODES = ["full", "hint", "secret"];

/** Add or edit a plan in the card library. */
export function EditPlanSheet({ plan, categories, onSave, onClose }) {
  const [p, setP] = useState(
    () =>
      plan || {
        id: `custom-${Math.random().toString(36).slice(2, 8)}`,
        category: "FUN",
        name: "",
        place: "",
        address: "",
        mapsLink: "",
        duration: 30,
        cost: "$",
        closesAt: null,
        revealMode: "hint",
        jessFull: "",
        jessHint: "",
        hostNotes: "",
        caption: "",
        icon: "✦",
        backup: "",
        enabled: true,
      }
  );
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const field = (label, key, opts = {}) => (
    <label className="k-field">
      <span>{label}</span>
      {opts.area ? (
        <textarea className="k-input" rows={2} value={p[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
      ) : (
        <input
          className="k-input"
          type={opts.type || "text"}
          value={p[key] ?? ""}
          placeholder={opts.placeholder}
          onChange={(e) => set(key, opts.type === "number" ? Number(e.target.value) : e.target.value || (opts.nullable ? null : ""))}
        />
      )}
    </label>
  );

  return (
    <Sheet title={plan ? "Edit plan" : "New plan"} onClose={onClose}>
      <label className="k-field">
        <span>Category</span>
        <select className="k-input" value={p.category} onChange={(e) => set("category", e.target.value)}>
          {Object.keys(categories).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="k-check">
        <input type="checkbox" checked={p.enabled !== false} onChange={(e) => set("enabled", e.target.checked)} /> Can be dealt tonight
      </label>
      <label className="k-check">
        <input type="checkbox" checked={!!p.meal} onChange={(e) => set("meal", e.target.checked)} /> This is a real meal
      </label>

      <p className="k-section">Only you see</p>
      {field("Plan name", "name")}
      {field("Place", "place")}
      {field("Address", "address")}
      {field("Maps link", "mapsLink")}
      {field("Duration (min)", "duration", { type: "number" })}
      {field("Cost ($ / $$ / $$$ / free)", "cost")}
      {field("Closes at (24h HH:MM, blank = late)", "closesAt", { placeholder: "21:00", nullable: true })}
      {field("What to do", "hostNotes", { area: true })}

      <p className="k-section">Jess sees after flipping</p>
      <label className="k-field">
        <span>Reveal mode</span>
        <select className="k-input" value={p.revealMode} onChange={(e) => set("revealMode", e.target.value)}>
          {REVEAL_MODES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      {field("Full reveal text", "jessFull", { placeholder: "ice cream run 🍦" })}
      {field("Hint text", "jessHint", { placeholder: "we're getting something sweet 👀" })}
      {field("Icon (emoji)", "icon")}
      {field("Scrapbook caption", "caption", { placeholder: "you demolished that btw" })}

      <button className="k-btn k-primary wide" disabled={!p.name.trim()} onClick={() => onSave(p)}>Save plan</button>
    </Sheet>
  );
}
