import { useState } from "react";
import { Bird } from "../components/icons.jsx";

const LINES = ["not yet 👀", "patience, jess", "*bird is also waiting*", "soon.", "no peeking"];

export default function Waiting({ me }) {
  const [chirp, setChirp] = useState(null);
  return (
    <section className="center-screen waiting">
      <span className="float-star" aria-hidden="true">✦</span>
      <button
        className={`perch ${chirp ? "hop" : ""}`}
        key={chirp?.key}
        onClick={() => setChirp({ text: LINES[Math.floor(Math.random() * LINES.length)], key: Date.now() })}
        aria-label="a little bird"
      >
        <Bird className="perch-bird" />
        {chirp && <span className="chirp">{chirp.text}</span>}
      </button>
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
