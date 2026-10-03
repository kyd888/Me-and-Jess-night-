import { memo, useMemo } from "react";
import { BirdGlyph } from "./icons.jsx";

/** Seeded so the stars stay in the same place between renders and refreshes. */
function makeStars(count) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 70,
    size: 1 + rand() * 2.2,
    delay: rand() * 6,
  }));
}

const TODS = ["morning", "day", "golden", "night"];

/**
 * The sky behind everything. It follows the time of day (see lib/timeOfDay.js)
 * and cross-fades between periods. Stars and the moon only come out at night.
 */
function Sky({ tod = "night" }) {
  const stars = useMemo(() => makeStars(48), []);
  return (
    <div className={`sky sky-is-${tod}`} aria-hidden="true">
      {TODS.map((t) => (
        <div key={t} className={`sky-layer sky-${t}`} style={{ opacity: t === tod ? 1 : 0 }} />
      ))}
      <div className="sun" />
      <div className="moon" />
      <div className="stars">
        {stars.map((s, i) => (
          <span key={i} className="star-slot" style={{ left: `${s.left}%`, top: `${s.top}%` }}>
            <span className="star" style={{ width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
          </span>
        ))}
      </div>
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
      <div className="flock">
        <BirdGlyph className="flyer flyer-1" />
        <BirdGlyph className="flyer flyer-2" />
        <BirdGlyph className="flyer flyer-3" />
      </div>
      <div className="grain" />
    </div>
  );
}

export default memo(Sky);
