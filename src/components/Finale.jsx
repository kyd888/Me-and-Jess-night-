import { Bird } from "./icons.jsx";

export default function Finale({ plan, step, onStep, picks }) {
  const f = plan.finale;

  if (step === 0) {
    return (
      <section className="finale finale-tease">
        <p className="eyebrow rise" style={{ "--d": "0.1s" }}>{f.label}</p>
        <h2 className="hand tease-line rise" style={{ "--d": "0.5s" }}>{f.tease}</h2>
        <button className="btn btn-primary rise" style={{ "--d": "1.6s" }} onClick={() => onStep(1)}>
          {f.teaseButton}
        </button>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="finale finale-box">
        <button className="gift" onClick={() => onStep(2)} aria-label="open the gift">
          <span className="gift-lid" />
          <span className="gift-body" />
          <span className="gift-ribbon" />
          <span className="gift-bow" />
        </button>
        <p className="hand big-hand rise" style={{ "--d": "0.8s" }}>{f.tapHint}</p>
      </section>
    );
  }

  const recap = plan.chapters
    .map((ch, i) => ({ ch, choice: ch.choices.find((c) => c.id === picks[i]) }))
    .filter((r) => r.choice);

  return (
    <section className="finale finale-open">
      <div className="burst" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ "--a": `${i * 30}deg`, "--d": `${(i % 4) * 0.05}s` }} />
        ))}
      </div>

      <h2 className="display display-sm rise" style={{ "--d": "0.2s" }}>{f.reveal}</h2>

      <div className="polaroids">
        {f.gifts.map((g, i) => (
          <figure key={i} className="polaroid rise" style={{ "--d": `${0.7 + i * 0.3}s`, "--tilt": `${i % 2 ? 4 : -5}deg` }}>
            <div className="polaroid-photo">{g.icon}</div>
            <figcaption className="hand">{g.caption}</figcaption>
          </figure>
        ))}
      </div>

      {f.basket?.length > 0 && (
        <ul className="basket rise" style={{ "--d": "1.4s" }}>
          {f.basket.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className="letter rise" style={{ "--d": "1.8s" }}>
        <p className="hand">{f.note}</p>
        <p className="hand signature">{plan.signature}</p>
      </div>

      {recap.length > 0 && (
        <div className="recap rise" style={{ "--d": "2.2s" }}>
          <p className="eyebrow">{f.recapTitle}</p>
          {recap.map(({ ch, choice }) => (
            <div key={ch.chapter} className="stub">
              <span className="stub-label">{ch.label}</span>
              <span className="stub-title">{choice.revealTitle}</span>
              <span className="stub-icon">{choice.icon}</span>
            </div>
          ))}
        </div>
      )}

      <p className="the-end rise" style={{ "--d": "2.6s" }}>
        <Bird className="end-bird" /> {f.end}
      </p>
    </section>
  );
}
