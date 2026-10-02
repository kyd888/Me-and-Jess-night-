import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Bird } from "./icons.jsx";
import { jessLink } from "../lib/share.js";

/** The screen you show Jess: she scans it and the night starts on her phone. */
export default function Handoff({ plan, onPreview }) {
  const link = jessLink(plan);
  const [svg, setSvg] = useState("");
  const [copied, setCopied] = useState(false);

  // Backup plan: text her the link instead.
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Tonight", url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  useEffect(() => {
    QRCode.toString(link, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#2b2340", light: "#00000000" },
    }).then(setSvg);
  }, [link]);

  return (
    <section className="handoff">
      <p className="eyebrow rise" style={{ "--d": "0.1s" }}>
        for {plan.her}
      </p>
      <h1 className="display display-sm rise" style={{ "--d": "0.3s" }}>
        Scan to start your night
      </h1>

      <div className="qr-card rise" style={{ "--d": "0.6s" }}>
        <Bird className="qr-bird" />
        <div className="qr" role="img" data-link={link} aria-label="QR code" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="hand qr-caption">point your camera here</p>
      </div>

      <div className="rise handoff-actions" style={{ "--d": "0.9s" }}>
        <button className="btn btn-ghost" onClick={onPreview}>
          Preview on this phone
        </button>
        <button className="link-btn" onClick={share}>
          {copied ? "link copied ✓" : "or send her the link"}
        </button>
      </div>
    </section>
  );
}
