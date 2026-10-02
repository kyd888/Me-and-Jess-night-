import { useState } from "react";
import { Reaction, pickReaction } from "../lib/reactions.jsx";

const OPTIONS = [
  ["surprise", "🩷", "Just surprise me"],
  ["feed", "🍜", "Feed me"],
  ["fun", "🎮", "Something fun"],
  ["chill", "☕", "Something chill"],
  ["sweet", "🍦", "Something sweet"],
  ["cozy", "🏠", "Can we just be cozy?"],
];

/** "not feeling this?": she picks a vibe, never a place. */
export default function RequestSheet({ me, onSend, onClose }) {
  const [phase, setPhase] = useState("pick"); // pick | sent | done
  const [mood, setMood] = useState(null);
  const [reaction, setReaction] = useState(null);

  const pick = async (m) => {
    setMood(m);
    const r = pickReaction(m === "surprise" ? "surprise" : "switch", { force: true });
    if (r?.src) new Image().src = r.src;
    setReaction(r);
    setPhase("sent");
    try {
      await onSend(m);
    } catch {
      setPhase("pick");
      return;
    }
    setTimeout(() => setPhase("done"), 2600);
    setTimeout(onClose, 5200);
  };

  const surprise = mood === "surprise";

  return (
    <div className="sheet-backdrop" onClick={phase === "pick" ? onClose : undefined}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {phase === "pick" && (
          <>
            <p className="sheet-title">what sounds better?</p>
            <div className="mood-grid">
              {OPTIONS.map(([id, emoji, label]) => (
                <button key={id} className={`mood ${id === "surprise" ? "mood-wide" : ""}`} onClick={() => pick(id)}>
                  <span className="mood-emoji">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
            <button className="quiet-link" onClick={onClose}>
              never mind
            </button>
          </>
        )}
        {phase === "sent" && <Reaction reaction={reaction} className="reaction-sheet pop-in" />}
        {phase === "done" && (
          <>
            <p className="sheet-big hand rise">{surprise ? "I got you." : "got it 👀"}</p>
          </>
        )}
      </div>
    </div>
  );
}
