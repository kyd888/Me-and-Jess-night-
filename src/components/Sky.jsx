import { memo, useMemo } from "react";
import { BirdGlyph } from "./icons.jsx";

/** Seeded so the stars stay in the same place between renders and refreshes. */
function makeStars(count) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: count }, (_, i) => ({
    left: rand() * 100,
    top: rand() * 70,
    size: 1 + rand() * 2.2,
    delay: rand() * 6,
    // Stars come out a few at a time as the night goes on.
    from: i < 8 ? 1 : i < 20 ? 2 : i < 34 ? 3 : 4,
  }));
}

function Sky({ phase }) {
  const stars = useMemo(() => makeStars(48), []);
  return (
    <div className="sky" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((p) => (
        <div key={p} className={`sky-layer sky-${p}`} style={{ opacity: p === phase ? 1 : 0 }} />
      ))}
      <div className="stars">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star-slot"
            style={{ left: `${s.left}%`, top: `${s.top}%`, opacity: phase >= s.from ? 1 : 0 }}
          >
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
