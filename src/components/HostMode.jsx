import { useState } from "react";

const FIELDS = [
  ["title", "Mystery title (what Jess sees)"],
  ["hint", "Hint"],
  ["icon", "Icon (emoji)"],
  ["revealTitle", "Reveal title"],
  ["location", "Location"],
  ["description", "Description", "textarea"],
  ["note", "Handwritten note"],
  ["mapLink", "Map link"],
];

function Field({ label, value, onChange, type }) {
  return (
    <label className="h-field">
      <span>{label}</span>
      {type === "textarea" ? (
        <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export default function HostMode({ plan, setPlan, progress, host, onClose }) {
  const [open, setOpen] = useState(progress.chapter);
  const [copied, setCopied] = useState(false);

  const editChapter = (ci, patch) =>
    setPlan((p) => ({
      ...p,
      chapters: p.chapters.map((ch, i) => (i === ci ? { ...ch, ...patch } : ch)),
    }));

  const editChoice = (ci, id, patch) =>
    editChapter(ci, {
      choices: plan.chapters[ci].choices.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const editFinale = (patch) => setPlan((p) => ({ ...p, finale: { ...p.finale, ...patch } }));

  const confirmThen = (msg, fn) => () => window.confirm(msg) && fn();

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this:", JSON.stringify(plan));
    }
  };

  const where =
    progress.screen === "intro"
      ? "Intro"
      : progress.screen === "finale"
      ? `Finale (step ${progress.finaleStep + 1}/3)`
      : `Chapter ${progress.chapter + 1} · ${progress.screen === "reveal" ? "revealed" : "choosing"}`;

  return (
    <div className="host" role="dialog" aria-label="Host Mode">
      <div className="host-sheet">
        <header className="host-top">
          <div>
            <p className="host-kicker">Host Mode</p>
            <p className="host-where">Now: {where}</p>
          </div>
          <button className="h-btn" onClick={onClose}>Done</button>
        </header>

        <section className="host-card">
          <h3>Controls</h3>
          <div className="h-row">
            <button className="h-btn h-accent" onClick={host.skip}>Skip ahead →</button>
            <button className="h-btn" onClick={confirmThen("Reset the night back to the intro? (Your card edits stay.)", host.resetNight)}>
              Reset night
            </button>
          </div>
          <p className="h-label">Jump to</p>
          <div className="h-row h-wrap">
            <button className="h-chip" onClick={() => host.jump("intro")}>Intro</button>
            {plan.chapters.map((ch, i) => (
              <button key={i} className="h-chip" onClick={() => host.jump(i)}>Ch {i + 1}</button>
            ))}
            <button className="h-chip" onClick={() => host.jump("finale")}>Finale</button>
          </div>
          <p className="h-label">Picks so far</p>
          {plan.chapters.map((ch, i) => {
            const c = ch.choices.find((x) => x.id === progress.picks[i]);
            return (
              <p key={i} className="h-small">
                Ch {i + 1}: {c ? c.revealTitle : "—"}
              </p>
            );
          })}
        </section>

        {plan.chapters.map((ch, ci) => (
          <section key={ci} className="host-card">
            <button className="h-acc" onClick={() => setOpen(open === ci ? -1 : ci)}>
              <span>
                {ch.label}: {ch.title}
              </span>
              <span>{open === ci ? "−" : "+"}</span>
            </button>
            {open === ci && (
              <div className="h-body">
                <Field label="Chapter title" value={ch.title} onChange={(v) => editChapter(ci, { title: v })} />
                <Field label="Chapter subtitle" value={ch.subtitle} onChange={(v) => editChapter(ci, { subtitle: v })} />
                {ch.choices.map((c) => (
                  <div key={c.id} className={`h-choice ${c.enabled === false ? "is-off" : ""}`}>
                    <div className="h-choice-top">
                      <strong>
                        {c.icon} {c.title}
                      </strong>
                      <label className="h-toggle">
                        <input
                          type="checkbox"
                          checked={c.enabled !== false}
                          onChange={(e) => editChoice(ci, c.id, { enabled: e.target.checked })}
                        />
                        <span>{c.enabled === false ? "Hidden" : "Showing"}</span>
                      </label>
                    </div>
                    {FIELDS.map(([key, label, type]) => (
                      <Field key={key} label={label} type={type} value={c[key]} onChange={(v) => editChoice(ci, c.id, { [key]: v })} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="host-card">
          <button className="h-acc" onClick={() => setOpen(open === "f" ? -1 : "f")}>
            <span>Finale</span>
            <span>{open === "f" ? "−" : "+"}</span>
          </button>
          {open === "f" && (
            <div className="h-body">
              <Field label="Tease line" value={plan.finale.tease} onChange={(v) => editFinale({ tease: v })} />
              <Field label="Reveal line" value={plan.finale.reveal} onChange={(v) => editFinale({ reveal: v })} />
              <Field label="Note" type="textarea" value={plan.finale.note} onChange={(v) => editFinale({ note: v })} />
              <Field
                label="Basket (comma separated)"
                value={plan.finale.basket.join(", ")}
                onChange={(v) => editFinale({ basket: v.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
              <Field label="Signature" value={plan.signature} onChange={(v) => setPlan((p) => ({ ...p, signature: v }))} />
            </div>
          )}
        </section>

        <section className="host-card">
          <h3>Plan</h3>
          <p className="h-small">Edits save on this phone automatically.</p>
          <div className="h-row">
            <button className="h-btn" onClick={copyPlan}>{copied ? "Copied ✓" : "Copy plan JSON"}</button>
            <button className="h-btn h-danger" onClick={confirmThen("Throw away all Host Mode edits and use the plan from the code?", host.restorePlan)}>
              Restore defaults
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
