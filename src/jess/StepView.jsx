import { useEffect, useState } from "react";
import Art from "./Art.jsx";
import { local } from "../lib/api.js";
import { Bird } from "../components/icons.jsx";

export default function StepView({ step, me, nightId, onReact, onNotFeelingIt }) {
  const tapKey = `jess-tapped-${nightId}-${step.id}`;
  const [tapped, setTapped] = useState(() => local.get(tapKey, false));
  const [flipped, setFlipped] = useState(false);

  // Flip the destination ticket a beat after Kyd reveals it.
  useEffect(() => {
    if (!step.revealed) return setFlipped(false);
    const t = setTimeout(() => setFlipped(true), 500);
    return () => clearTimeout(t);
  }, [step.revealed]);

  const tap = () => {
    if (tapped) return;
    setTapped(true);
    local.set(tapKey, true);
    onReact(step.button);
  };

  const clues = step.clues.slice(-3).reverse();

  return (
    <section className="step">
      <Art kind={step.animation} />
      {step.eyebrow && (
        <p className="eyebrow rise" style={{ "--d": "0.15s" }}>
          {step.eyebrow}
        </p>
      )}
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>
        {step.title}
      </h1>
      {step.body && (
        <p className="lede rise" style={{ "--d": "0.55s" }}>
          {step.body}
        </p>
      )}

      {step.hint && (
        <p className="scrap hand rise" style={{ "--d": "0.8s" }}>
          hint: {step.hint}
        </p>
      )}

      {clues.map((c, i) => (
        <p key={c.id} className={`scrap scrap-pink hand ${i === 0 ? "pop-in" : ""}`}>
          {c.text}
        </p>
      ))}

      {step.destination && (
        <div className={`flip dest ${flipped ? "is-flipped" : ""}`}>
          <div className="flip-inner">
            <div className="face face-back">
              <span className="back-stars" />
              <span className="back-label">destination</span>
              <span className="back-title">unlocking…</span>
              <Bird className="back-bird" />
            </div>
            <div className="face face-front">
              <p className="stamp">destination unlocked</p>
              <h2 className="reveal-title">{step.destination.name}</h2>
              {step.destination.note && <p className="hand dest-note">{step.destination.note}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="step-actions rise" style={{ "--d": "1s" }}>
        {step.button &&
          (tapped ? (
            <p className="sent hand">sent ✓ {me} knows 🩷</p>
          ) : (
            <button className="btn btn-primary wide" onClick={tap}>
              {step.button}
            </button>
          ))}
        {step.allowChange &&
          (step.requested ? (
            <p className="quiet-link">request sent 👀</p>
          ) : (
            <button className="quiet-link" onClick={onNotFeelingIt}>
              not feeling this?
            </button>
          ))}
      </div>
    </section>
  );
}
