import { Bird } from "../components/icons.jsx";

const GLYPHS = {
  door: "🚪",
  gift: "🎁",
  car: "🚗",
  ticket: "🎟️",
  bowl: "🍜",
  sparkle: "✨",
  sweet: "🍦",
  moon: "🌙",
  coffee: "☕",
  game: "🎮",
};

/** The little medallion at the top of each chapter, with a bird perched on it. */
export default function Art({ kind }) {
  const glyph = GLYPHS[kind];
  return (
    <div className={`art art-${kind}`} aria-hidden="true">
      <span className="art-ring" />
      <span className="art-glyph">{glyph || <Bird className="art-bird-solo" />}</span>
      {glyph && <Bird className="art-perch" />}
      <span className="art-spark s1">✦</span>
      <span className="art-spark s2">✦</span>
    </div>
  );
}
