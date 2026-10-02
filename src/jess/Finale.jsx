import { Bird } from "../components/icons.jsx";
import { Tickets } from "./Scrapbook.jsx";

export default function Finale({ finale, scrapbook }) {
  return (
    <section className="finale">
      <div className="burst" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ "--a": `${i * 30}deg`, "--d": `${(i % 4) * 0.05}s` }} />
        ))}
      </div>
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>{finale.title}</h1>

      {scrapbook.length > 0 && (
        <div className="rise finale-tickets" style={{ "--d": "0.8s" }}>
          <p className="eyebrow">tonight</p>
          <Tickets items={scrapbook} />
        </div>
      )}

      <div className="letter rise" style={{ "--d": "1.4s" }}>
        <p className="hand">{finale.note}</p>
        <p className="hand signature">{finale.signature}</p>
      </div>

      <p className="the-end rise" style={{ "--d": "1.8s" }}>
        <Bird className="end-bird" /> the end (for now)
      </p>
    </section>
  );
}
