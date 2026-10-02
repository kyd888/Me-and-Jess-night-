import { BirdIcon, Heart, Moon, Star } from "./icons.jsx";

const ICONS = [Moon, Star, BirdIcon, Heart];

/** 🌙 ○ ○ ○ that fills in gold as the night goes on. */
export default function Progress({ total, done, active }) {
  return (
    <nav className="progress" aria-label={`Part ${active + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const Icon = ICONS[i % ICONS.length];
        const state = i < done ? "done" : i === active ? "active" : "todo";
        return (
          <span key={i} className={`progress-dot is-${state}`}>
            {state === "todo" ? <span className="progress-empty" /> : <Icon className="progress-icon" />}
            {i < total - 1 && <span className={`progress-line ${i < done ? "is-lit" : ""}`} />}
          </span>
        );
      })}
    </nav>
  );
}
