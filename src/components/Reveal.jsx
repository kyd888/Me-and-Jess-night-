import { useEffect, useState } from "react";
import { Bird, Pin } from "./icons.jsx";

export default function Reveal({ chapter, choice, onNext, isLast }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 450);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="reveal">
      <div className={`flip ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped(true)}>
        <div className="flip-inner">
          <div className="face face-back" aria-hidden={flipped}>
            <span className="back-stars" />
            <span className="back-label">{chapter.label}</span>
            <span className="back-title">{choice.title}</span>
            <Bird className="back-bird" />
          </div>

          <article className="face face-front" aria-hidden={!flipped}>
            <p className="stamp">
              {chapter.label} · {choice.title}
            </p>
            <span className="reveal-icon">{choice.icon}</span>
            <h2 className="reveal-title">{choice.revealTitle}</h2>
            {choice.location && (
              <p className="reveal-location">
                <Pin className="pin" /> {choice.location}
              </p>
            )}
            <p className="reveal-desc">{choice.description}</p>
            {choice.note && <p className="scrap hand">{choice.note}</p>}
            {choice.mapLink && (
              <a className="btn btn-ghost" href={choice.mapLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                Open in Maps
              </a>
            )}
          </article>
        </div>
      </div>

      <div className={`after ${flipped ? "is-shown" : ""}`}>
        <p className="hand big-hand">{isLast ? "Ready for one last thing?" : "Ready for the next one?"}</p>
        <button className="btn btn-primary" onClick={onNext}>
          {isLast ? "I'm ready" : "Next chapter →"}
        </button>
        <p className="tiny">tap whenever you're done here, no rush</p>
      </div>
    </section>
  );
}
