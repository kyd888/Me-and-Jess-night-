import { useState } from "react";
import { Bird } from "../components/icons.jsx";
import { Reaction, pickReaction } from "../lib/reactions.jsx";

const LINES = ["not yet 👀", "patience, jess", "*bird is also waiting*", "soon.", "no peeking"];

export default function Waiting({ me }) {
  const [chirp, setChirp] = useState(null);
  const [taps, setTaps] = useState(0);
  const [egg, setEgg] = useState(null);
  return (
    <section className="center-screen waiting">
      <span className="float-star" aria-hidden="true">✦</span>
      <button
        className={`perch ${chirp ? "hop" : ""}`}
        key={chirp?.key}
        onClick={() => {
          setTaps(taps + 1);
          if (taps + 1 === 5) setEgg(pickReaction("easterEgg", { force: true }));
          setChirp({ text: LINES[Math.floor(Math.random() * LINES.length)], key: Date.now() });
        }}
        aria-label="a little bird"
      >
        <Bird className="perch-bird" />
        {chirp && <span className="chirp">{chirp.text}</span>}
      </button>
      {/* Hidden detail: bother the bird 5 times. */}
      {egg && <Reaction reaction={egg} className="easter-cat pop-in" />}
      <h1 className="display rise" style={{ "--d": "0.2s" }}>
        Tonight, Jess.
      </h1>
      <p className="lede rise" style={{ "--d": "0.6s" }}>
        Your night isn't ready yet.
      </p>
      <p className="tiny rise" style={{ "--d": "1s" }}>
        {me} will start this when you're actually here.
      </p>
    </section>
  );
}
