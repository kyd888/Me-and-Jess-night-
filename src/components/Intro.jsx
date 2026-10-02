import { useRef, useState } from "react";
import { Bird, Moon } from "./icons.jsx";

export default function Intro({ plan, onStart }) {
  const { intro } = plan;
  const [chirp, setChirp] = useState(null);
  const [secret, setSecret] = useState(false);
  const moonTaps = useRef(0);
  const moonTimer = useRef();

  // Hidden detail #1: tap the bird.
  const tapBird = () => {
    const lines = plan.birdLines;
    setChirp({ text: lines[Math.floor(Math.random() * lines.length)], key: Date.now() });
  };

  // Hidden detail #2: triple-tap the moon.
  const tapMoon = () => {
    moonTaps.current += 1;
    clearTimeout(moonTimer.current);
    moonTimer.current = setTimeout(() => (moonTaps.current = 0), 700);
    if (moonTaps.current >= 3) {
      moonTaps.current = 0;
      setSecret((s) => !s);
    }
  };

  return (
    <section className="intro">
      <button className="intro-moon" onClick={tapMoon} aria-label="moon">
        <Moon />
      </button>

      <p className="eyebrow rise" style={{ "--d": "0.2s" }}>
        {intro.eyebrow}
      </p>

      <div className="title-wrap rise" style={{ "--d": "0.5s" }}>
        <button className={`perch ${chirp ? "hop" : ""}`} key={chirp?.key} onClick={tapBird} aria-label="a little bird">
          <Bird className="perch-bird" />
          {chirp && <span className="chirp">{chirp.text}</span>}
        </button>
        <h1 className="display">{intro.title}</h1>
      </div>

      <p className="lede rise" style={{ "--d": "0.9s" }}>
        {intro.subtitle}
      </p>

      <div className="rise" style={{ "--d": "1.3s" }}>
        <button className="btn btn-primary" onClick={onStart}>
          {intro.button}
        </button>
        <p className="hand aside">{intro.aside}</p>
      </div>

      <p className={`secret hand ${secret ? "is-shown" : ""}`}>{plan.moonSecret}</p>
    </section>
  );
}
