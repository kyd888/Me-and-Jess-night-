import { fmtTime } from "../lib/api.js";

/** Tickets for things that already happened. Never anything in the future. */
export function Tickets({ items }) {
  return (
    <ol className="tickets-list">
      {items.map((t, i) => (
        <li key={t.stepId} className="memory" style={{ "--tilt": `${[-1.2, 0.9, -0.5, 1.3][i % 4]}deg`, "--d": `${0.1 + i * 0.08}s` }}>
          <div className="memory-main">
            <span className="memory-label">{t.label}</span>
            <span className="memory-title">{t.title}</span>
            <span className="memory-line hand">{t.line}</span>
          </div>
          <div className="memory-stub">
            <span className="memory-time">{fmtTime(t.at)}</span>
            <span className="memory-no">{String(i + 1).padStart(2, "0")}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Scrapbook({ items, onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet sheet-tall" onClick={(e) => e.stopPropagation()}>
        <p className="sheet-title">your night so far</p>
        {items.length ? <Tickets items={items} /> : <p className="tiny">nothing yet. give it a minute.</p>}
        <button className="btn btn-ghost" onClick={onClose}>
          close
        </button>
      </div>
    </div>
  );
}
