import { useState } from "react";

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

  const pick = async (m) => {
    setMood(m);
    setPhase("sent");
    try {
      await onSend(m);
    } catch {
      setPhase("pick");
      return;
    }
    setTimeout(() => setPhase("done"), 1600);
    setTimeout(onClose, 3800);
  };

  const surprise = mood === "surprise";

  return (
    <div className="sheet-backdrop" onClick={phase === "pick" ? onClose : undefined}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        {phase === "pick" && (
          <>
            <p className="sheet-title">What sounds better?</p>
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
        {phase === "sent" && (
          <>
            <img className="sticker sticker-center pop-in" src={surprise ? "/memes/text_stickers/correct_answer.png" : "/memes/text_stickers/i_know_thats_right.png"} alt="" />
            <p className="sheet-big rise">{surprise ? "Correct answer." : `Request sent to ${me} 👀`}</p>
          </>
        )}
        {phase === "done" && (
          <p className="sheet-big hand rise">
            {surprise ? `${me} has it from here.` : "Okay, you're off planning duty again."}
          </p>
        )}
      </div>
    </div>
  );
}
