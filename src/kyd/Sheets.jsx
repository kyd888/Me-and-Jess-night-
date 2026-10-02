import { useState } from "react";

const CATEGORIES = ["DINNER", "DESSERT", "GAMES", "COZY", "COFFEE", "RANDOM", "AT HOME"];

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
          <button key={p} className="k-chip" onClick={() => onSend(p)}>
            {p}
          </button>
        ))}
      </div>
      <textarea className="k-input" rows={2} placeholder="or type your own…" value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />
      <button className="k-btn k-primary wide" disabled={!text.trim()} onClick={() => onSend(text.trim())}>
        Send
      </button>
    </Sheet>
  );
}

/** The private backup bank. */
export function BackupSheet({ state, categories, hasCurrent, onUse, onClose }) {
  const [cat, setCat] = useState(categories?.[0] || "DINNER");
  const list = state.backups.filter((b) => b.category === cat);
  const used = new Set(state.usedBackups);
  return (
    <Sheet title="Change plan" onClose={onClose}>
      <div className="k-tabs">
        {CATEGORIES.map((c) => (
          <button key={c} className={`k-tab ${c === cat ? "is-on" : ""}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="k-backups">
        {list.map((b) => (
          <div key={b.id} className="k-backup">
            <p className="k-title">
              {b.name} {used.has(b.id) && <span className="k-tag">used</span>}
            </p>
            <p className="k-muted">{b.description}</p>
            <p className="k-muted small">
              ~{b.estimatedDuration} min · {b.costLevel} · open until {b.openUntil}
              {b.address ? ` · ${b.address}` : ""}
            </p>
            {b.reasonJessMightLikeIt && <p className="k-note">{b.reasonJessMightLikeIt}</p>}
            <div className="k-row gap">
              <button className="k-btn k-primary" onClick={() => onUse(b.id, "next")}>Make it next</button>
              {hasCurrent && (
                <button className="k-btn" onClick={() => onUse(b.id, "replace")}>Replace current</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="k-muted small">Jess never sees this list. Nothing shows on her phone until you tap REVEAL.</p>
    </Sheet>
  );
}

const STATUSES = ["at_home", "leaving", "traveling", "at_destination", "transition", "dessert", "ending"];
const ANIMATIONS = ["door", "gift", "car", "ticket", "bowl", "sparkle", "sweet", "moon", "coffee", "game", "bird"];

/** Add or edit a step. */
export function EditStepSheet({ step, onSave, onClose }) {
  const [s, setS] = useState(
    () =>
      step || {
        id: `step-${Math.random().toString(36).slice(2, 8)}`,
        status: "at_destination",
        eyebrow: "",
        animation: "sparkle",
        title: "",
        body: "",
        hint: "",
        button: "okay 👀",
        stamp: "",
        memory: "",
        estimatedMinutes: 30,
        hostNotes: "",
        allowChange: true,
        destination: null,
      }
  );
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const setD = (k, v) => setS((x) => ({ ...x, destination: { ...(x.destination || {}), [k]: v } }));

  const field = (label, value, onChange, opts = {}) => (
    <label className="k-field">
      <span>{label}</span>
      {opts.area ? (
        <textarea className="k-input" rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="k-input" type={opts.type || "text"} value={value ?? ""} onChange={(e) => onChange(opts.type === "number" ? Number(e.target.value) : e.target.value)} />
      )}
    </label>
  );

  const save = () => {
    const out = { ...s };
    if (out.destination && !out.destination.name) out.destination = null;
    onSave(out);
  };

  return (
    <Sheet title={step ? "Edit step" : "New step"} onClose={onClose}>
      <p className="k-section">Jess sees</p>
      {field("Small label (e.g. Chapter 3)", s.eyebrow, (v) => set("eyebrow", v))}
      {field("Title", s.title, (v) => set("title", v))}
      {field("Line under it", s.body, (v) => set("body", v))}
      {field("Hint (sticky note, optional)", s.hint, (v) => set("hint", v))}
      {field("Her button", s.button, (v) => set("button", v))}
      <label className="k-field">
        <span>Picture</span>
        <select className="k-input" value={s.animation} onChange={(e) => set("animation", e.target.value)}>
          {ANIMATIONS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <label className="k-check">
        <input type="checkbox" checked={s.allowChange !== false} onChange={(e) => set("allowChange", e.target.checked)} /> Show "not feeling this?"
      </label>

      <p className="k-section">Destination (hidden until you reveal)</p>
      {field("Name", s.destination?.name, (v) => setD("name", v))}
      {field("Note she sees on reveal", s.destination?.note, (v) => setD("note", v))}
      {field("Address (private)", s.destination?.address, (v) => setD("address", v))}
      {field("Maps link (private)", s.destination?.mapsLink, (v) => setD("mapsLink", v))}
      {field("Open until (private)", s.destination?.openUntil, (v) => setD("openUntil", v))}

      <p className="k-section">Only you</p>
      <label className="k-field">
        <span>Status</span>
        <select className="k-input" value={s.status} onChange={(e) => set("status", e.target.value)}>
          {STATUSES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      {field("Estimated minutes", s.estimatedMinutes, (v) => set("estimatedMinutes", v), { type: "number" })}
      {field("Notes to self", s.hostNotes, (v) => set("hostNotes", v), { area: true })}
      {field("Scrapbook label (e.g. Stop 03)", s.stamp, (v) => set("stamp", v))}
      {field("Scrapbook memory (default: destination name)", s.memory, (v) => set("memory", v))}

      <button className="k-btn k-primary wide" disabled={!s.title.trim()} onClick={save}>
        Save step
      </button>
    </Sheet>
  );
}
