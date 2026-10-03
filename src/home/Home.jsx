import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import Sky from "../components/Sky.jsx";
import { Bird } from "../components/icons.jsx";
import { fmtTime, guestApi, usePoll } from "../lib/api.js";
import { jessLink } from "../lib/links.js";
import { Reaction, pickReaction } from "../lib/reactions.jsx";
import { greeting, useTimeOfDay } from "../lib/timeOfDay.js";

const ALARM_MS = 1800; // "wait…"
const GIF_MS = 4200; // the celebration GIF

/**
 * The laptop page. A big QR code for Jess to scan when she walks in.
 * The moment she scans it, this page loses it a little ("SHE'S HERE 🚨"),
 * then settles into "oh hey Jess 👋" with the QR code officially retired.
 */
export default function Home() {
  const link = jessLink({ arrive: true });
  const [svg, setSvg] = useState("");
  const { data } = usePoll(guestApi.get, 2000);
  const tod = useTimeOfDay();
  const [scene, setScene] = useState("waiting"); // waiting | alarm | gif | arrived
  const [reaction, setReaction] = useState(null);
  const seen = useRef(undefined);
  const timers = useRef([]);

  useEffect(() => {
    QRCode.toString(link, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#3a1f33", light: "#00000000" } }).then(setSvg);
  }, [link]);

  // React to her scan. If this page was opened long after she arrived, just show the settled state.
  useEffect(() => {
    if (!data) return;
    const arrived = data.arrivedAt;
    const first = seen.current === undefined;
    seen.current = arrived;
    if (!arrived) return setScene("waiting");
    if (!first || Date.now() - arrived < 60000) {
      if (scene !== "waiting") return;
      const r = pickReaction("arrived", { force: true });
      if (r?.src) new Image().src = r.src;
      setReaction(r);
      setScene("alarm");
      timers.current.push(setTimeout(() => setScene("gif"), ALARM_MS));
      timers.current.push(setTimeout(() => setScene("arrived"), ALARM_MS + GIF_MS));
    } else {
      setScene("arrived");
    }
  }, [data?.arrivedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finished = data?.status === "finished";

  return (
    <>
      <Sky tod={tod} />
      <main className={`home scene-${scene}`}>
        {scene === "waiting" && (
          <>
            <section className="home-copy">
              <h1 className="display home-title rise" style={{ "--d": "0.3s" }}>{greeting(tod)}</h1>
              <p className="lede home-lede rise" style={{ "--d": "0.6s" }}>scan this 👀</p>
            </section>
            <section className="home-qr rise" style={{ "--d": "0.5s" }}>
              <Bird className="qr-bird" />
              <div className="qr" role="img" aria-label="QR code" dangerouslySetInnerHTML={{ __html: svg }} />
            </section>
            {/* Opened this on a phone instead of a laptop? No need to scan. */}
            <a className="btn btn-primary home-phone" href={link}>open →</a>
          </>
        )}

        {scene === "alarm" && (
          <section className="home-alarm">
            <h1 className="display home-wait">wait…</h1>
          </section>
        )}

        {scene === "arrived" && (
          <>
            <section className="home-copy">
              <h1 className="display home-title rise" style={{ "--d": "0.1s" }}>{finished ? "that was fun 🩷" : "oh hey Jess 👋"}</h1>
              <p className="lede home-lede rise" style={{ "--d": "0.4s" }}>{finished ? "10/10 would hang again" : "look at your phone 👀"}</p>
              <p className="hand home-hand rise" style={{ "--d": "0.8s" }}>the QR code has retired 🫡</p>
            </section>
            <section className="home-qr retired" aria-hidden="true">
              <Bird className="qr-bird qr-bird-asleep" />
              <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
              <span className="qr-stamp">
                scanned ✓<small>{fmtTime(data?.arrivedAt)}</small>
              </span>
            </section>
          </>
        )}
      </main>

      {scene === "gif" &&
        createPortal(
          <div className="home-gif">
            <Confetti />
            <Reaction reaction={reaction} className="reaction-big" />
          </div>,
          document.body
        )}
    </>
  );
}

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.2 + Math.random() * 1.6,
      rot: Math.random() * 360,
      color: ["#f7a8c0", "#ffd59e", "#fff6f1", "#e0708f", "#a9d3f2"][i % 5],
    }))
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.current.map((p, i) => (
        <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.color, "--rot": `${p.rot}deg` }} />
      ))}
    </div>
  );
}
