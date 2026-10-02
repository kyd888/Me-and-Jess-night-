import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clues } from "./Clues.jsx";
import { local } from "../lib/api.js";

const MEME_MS = 1900;

/** One face of a mystery card. Never a clue, just vibes. */
function Face({ face, big }) {
  return (
    <span className={`face-art ${big ? "big" : ""}`}>
      {face.icon && <span className="face-icon">{face.icon}</span>}
      {face.text && <span className="face-text hand">{face.text}</span>}
    </span>
  );
}

/**
 * Face-down cards → she picks → (sometimes a meme) → the card flips.
 * The server decides what's under each card; this phone never knows
 * until she's picked.
 */
export default function Round({ round, clues, me, nightId, onPick, onReact, onNotFeelingIt }) {
  const alreadyPicked = !!round.picked;
  const [chosen, setChosen] = useState(round.picked);
  const [stage, setStage] = useState(alreadyPicked ? "revealed" : "choose"); // choose | waiting | meme | flipping | revealed
  const [meme, setMeme] = useState(null);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapKey = `jess-tapped-${nightId}-${round.id}`;
  const [tapped, setTapped] = useState(() => local.get(tapKey, false));

  const pick = async (cardId) => {
    if (chosen) return;
    setChosen(cardId);
    setStage("waiting");
    try {
      const view = await onPick(cardId);
      const m = view?.round?.meme;
      if (m) {
        setMeme(m);
        later(() => setStage("meme"), 500);
        later(() => setStage("flipping"), 500 + MEME_MS);
      } else {
        later(() => setStage("flipping"), 650);
      }
      later(() => setStage("revealed"), (m ? 500 + MEME_MS : 650) + 1100);
    } catch {
      setChosen(null);
      setStage("choose");
    }
  };

  const card = round.cards.find((c) => c.id === chosen);
  const r = round.reveal;
  const flipped = stage === "flipping" || stage === "revealed";

  return (
    <section className="round">
      <header className="round-head">
        <p className="eyebrow rise" style={{ "--d": "0.05s" }}>round {String(round.n).padStart(2, "0")}</p>
        <h1 className="display display-sm rise" style={{ "--d": "0.2s" }}>{round.label}</h1>
        {!chosen && <p className="lede rise" style={{ "--d": "0.4s" }}>{round.intro}</p>}
      </header>

      {!chosen || stage === "waiting" ? (
        <ul className={`deck deck-${round.cards.length}`}>
          {round.cards.map((c, i) => (
            <li key={c.id} className="deal" style={{ "--d": `${0.5 + i * 0.12}s`, "--tilt": `${[-3, 2, -1.5, 3][i % 4]}deg` }}>
              <button
                className={`mystery ${chosen === c.id ? "is-chosen" : chosen ? "is-gone" : ""}`}
                onClick={() => pick(c.id)}
                disabled={!!chosen}
                aria-label={`card ${i + 1}`}
              >
                <span className="mystery-stars" />
                <Face face={c.face} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`flip big-flip ${flipped ? "is-flipped" : ""}`}>
          <div className="flip-inner">
            <div className="face face-back mystery-back">
              <span className="mystery-stars" />
              {card && <Face face={card.face} big />}
            </div>
            <article className="face face-front reveal-card">
              {r && (
                <>
                  <p className="stamp">card {String(round.n).padStart(2, "0")} · {round.label}</p>
                  <p className="reveal-line">{r.line}</p>
                  <span className="reveal-icon">{r.mode === "secret" || r.mode === "swapped" ? "🤫" : r.icon}</span>
                  <h2 className="reveal-title">{r.text}</h2>
                  {r.sub && <p className="reveal-sub">{r.sub}</p>}
                  {r.sticker && <img className="sticker" src={r.sticker} alt="" />}
                </>
              )}
            </article>
          </div>
        </div>
      )}

      {/* Portaled: the screen's entrance animation would otherwise trap position: fixed. */}
      {stage === "meme" &&
        meme &&
        createPortal(
          <div className="meme-pop">
            <img src={meme.src} alt="" />
            {meme.line && <p className="meme-line">{meme.line}</p>}
          </div>,
          document.body
        )}

      {stage === "revealed" && (
        <>
          {r?.aside && <p className="scrap hand pop-in">{r.aside}</p>}
          <Clues clues={clues} />
          <div className="step-actions rise" style={{ "--d": "0.3s" }}>
            {tapped ? (
              <p className="sent hand">sent ✓ {me} knows 🩷</p>
            ) : (
              <button
                className="btn btn-primary wide"
                onClick={() => {
                  setTapped(true);
                  local.set(tapKey, true);
                  onReact("let's go 🫡");
                }}
              >
                let's go 🫡
              </button>
            )}
            {round.requested ? (
              <p className="quiet-link">request sent 👀</p>
            ) : (
              <button className="quiet-link" onClick={onNotFeelingIt}>not feeling this?</button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
