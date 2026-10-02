import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Sky from "../components/Sky.jsx";
import { Bird } from "../components/icons.jsx";
import { guestApi, sessionId, usePoll } from "../lib/api.js";

const jessLink = () => `${window.location.origin}/jess${sessionId !== "tonight" ? `?s=${encodeURIComponent(sessionId)}` : ""}`;

const STATUS_LINES = {
  waiting: ["point your phone camera here.", "it'll wait for you."],
  started: ["it already started 👀", "scan to catch up."],
  finished: ["that's the night 🩷", "scan to see your scrapbook."],
};

/**
 * The laptop page: a big QR code for Jess to scan when she walks in.
 * Lives at the site root (/). It shows nothing about the plan.
 */
export default function Home() {
  const link = jessLink();
  const [svg, setSvg] = useState("");
  const { data } = usePoll(guestApi.get, 5000);
  const [title, sub] = STATUS_LINES[data?.status || "waiting"];

  useEffect(() => {
    QRCode.toString(link, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#3a1f33", light: "#00000000" } }).then(setSvg);
  }, [link]);

  return (
    <>
      <Sky phase={data?.phase ?? 0} />
      <main className="home">
        <section className="home-copy">
          <p className="eyebrow rise" style={{ "--d": "0.1s" }}>for Jess</p>
          <h1 className="display home-title rise" style={{ "--d": "0.3s" }}>Tonight, Jess.</h1>
          <p className="lede home-lede rise" style={{ "--d": "0.6s" }}>{title}</p>
          <p className="hand home-hand rise" style={{ "--d": "0.9s" }}>{sub}</p>
        </section>

        <section className="home-qr rise" style={{ "--d": "0.5s" }}>
          <Bird className="qr-bird" />
          <div className="qr" role="img" aria-label="QR code to Jess's page" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="hand qr-caption">scan me 👀</p>
        </section>

        {/* Opened this on a phone instead of a laptop? No need to scan. */}
        <a className="btn btn-primary home-phone" href={link}>
          open it on this phone →
        </a>
      </main>
    </>
  );
}
