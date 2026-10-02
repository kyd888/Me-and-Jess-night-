import { useState } from "react";
import { Bird } from "../components/icons.jsx";

const LINES = (me) => [
  ["phone down.", "enjoy this part 😌"],
  ["next part loading…", `${me} is cooking something up 🧍🏾‍♂️`],
  ["intermission.", `look at ${me}. he's right there.`],
  ["new cards soon 👀", "don't refresh, I got you."],
];

/** Between rounds: nothing to do but be on the date. */
export default function Between({ me, clues }) {
  const [[title, sub]] = useState(() => {
    const l = LINES(me);
    return [l[Math.floor(Math.random() * l.length)]];
  });
  return (
    <section className="center-screen between">
      <Bird className="loading-bird" />
      <h1 className="display display-sm rise" style={{ "--d": "0.2s" }}>{title}</h1>
      <p className="lede rise" style={{ "--d": "0.5s" }}>{sub}</p>
      {clues.length > 0 && (
        <div className="rise" style={{ "--d": "0.8s" }}>
          {clues.slice(-2).reverse().map((c) => (
            <p key={c.id} className="scrap scrap-pink hand">{c.text}</p>
          ))}
        </div>
      )}
    </section>
  );
}
