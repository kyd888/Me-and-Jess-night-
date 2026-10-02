import { useEffect, useRef, useState } from "react";

const PICK_DELAY = 750;

export default function Chapter({ chapter, index, onPick, onSkip }) {
  const choices = chapter.choices.filter((c) => c.enabled !== false);
  const [chosen, setChosen] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (id) => {
    if (chosen) return;
    setChosen(id);
    timer.current = setTimeout(() => onPick(id), PICK_DELAY);
  };

  return (
    <section className="chapter">
      <header className="chapter-head">
        <p className="eyebrow rise" style={{ "--d": "0.05s" }}>
          {chapter.label}
        </p>
        <h2 className="display display-sm rise" style={{ "--d": "0.25s" }}>
          {chapter.title}
        </h2>
        {chapter.subtitle && (
          <p className="lede lede-sm rise" style={{ "--d": "0.45s" }}>
            {chapter.subtitle}
          </p>
        )}
      </header>

      {choices.length === 0 ? (
        <div className="rise" style={{ "--d": "0.6s" }}>
          <p className="hand big-hand">This one's a surprise. Follow my lead.</p>
          <button className="btn btn-primary" onClick={onSkip}>
            Okay, okay
          </button>
        </div>
      ) : (
        <ul className="tickets">
          {choices.map((c, i) => {
            const state = !chosen ? "" : chosen === c.id ? "is-chosen" : "is-dismissed";
            return (
              <li key={c.id} className="deal" style={{ "--d": `${0.6 + i * 0.14}s` }}>
                <div className={`ticket-wrap ${state}`} style={{ "--tilt": `${[-1.2, 0.8, -0.4][i % 3]}deg` }}>
                <button className="ticket" onClick={() => choose(c.id)} disabled={!!chosen}>
                  <span className="ticket-main">
                    <span className="ticket-no">
                      No. {String(index + 1).padStart(2, "0")}·{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="ticket-title">{c.title}</span>
                    <span className="ticket-hint hand">{c.hint}</span>
                  </span>
                  <span className="ticket-stub">
                    <span className="ticket-icon">{c.icon || "✦"}</span>
                    <span className="ticket-admit">admit one<br />jess</span>
                  </span>
                </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
