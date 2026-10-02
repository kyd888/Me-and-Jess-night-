import { useState } from "react";
import Art from "./Art.jsx";
import { Clues } from "./Clues.jsx";
import { local } from "../lib/api.js";

/** Scripted opening beats (come inside, flowers). Kyd moves these along. */
export default function Beat({ beat, clues, me, nightId, onReact }) {
  const tapKey = `jess-tapped-${nightId}-${beat.id}`;
  const [tapped, setTapped] = useState(() => local.get(tapKey, false));

  const tap = () => {
    setTapped(true);
    local.set(tapKey, true);
    onReact(beat.button);
  };

  return (
    <section className="step">
      <Art kind={beat.animation} />
      {beat.eyebrow && <p className="eyebrow rise" style={{ "--d": "0.15s" }}>{beat.eyebrow}</p>}
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>{beat.title}</h1>
      {beat.body && <p className="lede rise" style={{ "--d": "0.55s" }}>{beat.body}</p>}
      <Clues clues={clues} />
      <div className="step-actions rise" style={{ "--d": "1s" }}>
        {beat.button &&
          (tapped ? (
            <p className="sent hand">got it ✓</p>
          ) : (
            <button className="btn btn-primary wide" onClick={tap}>{beat.button}</button>
          ))}
      </div>
    </section>
  );
}
