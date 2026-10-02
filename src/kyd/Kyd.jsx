import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { fmtTime, hostApi, local, sessionId, usePoll } from "../lib/api.js";
import { BackupSheet, EditStepSheet, TextSheet } from "./Sheets.jsx";
import PlanList from "./PlanList.jsx";
import "./kyd.css";

const MESSAGE_PRESETS = ["Time to go.", "Look at Kyd.", "One more stop.", "Check the car.", "Trust me.", "Don't open that yet.", "Okay you can look now."];
const CLUE_PRESETS = ["it's close.", "you've never been here.", "it involves food.", "bring a jacket.", "you're gonna like this one.", "think birds. (not really.)"];

const STATUS_LABEL = {
  waiting: "Waiting for Jess",
  started: "Date in progress",
  finished: "Night finished",
};

function useNow(ms = 15000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

const mins = (ms) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await hostApi.get(pin);
      local.set("kyd-pin", pin);
      onUnlock(pin);
    } catch (e2) {
      setErr(e2.status === 401 ? "Nope. Try again." : "Can't reach the server.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="kyd kyd-gate">
      <form onSubmit={submit} className="gate">
        <p className="k-kicker">Control Room</p>
        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoFocus
        />
        <button className="k-btn k-primary" disabled={!pin || busy}>
          {busy ? "…" : "Unlock"}
        </button>
        {err && <p className="k-err">{err}</p>}
      </form>
    </div>
  );
}

export default function Kyd() {
  const [pin, setPin] = useState(() => local.get("kyd-pin", ""));
  if (!pin) return <PinGate onUnlock={setPin} />;
  return <ControlRoom pin={pin} onLock={() => (local.set("kyd-pin", ""), setPin(""))} />;
}

function ControlRoom({ pin, onLock }) {
  const { data, setData, error } = usePoll(() => hostApi.get(pin), 2500);
  const [sheet, setSheet] = useState(null); // {type, ...}
  const [flash, setFlash] = useState(null);
  const [busy, setBusy] = useState(false);
  const now = useNow();

  useEffect(() => {
    if (error?.status === 401) onLock();
  }, [error, onLock]);

  const act = async (action, okText) => {
    setBusy(true);
    try {
      setData(await hostApi.send(pin, action));
      if (okText) {
        setFlash(okText);
        setTimeout(() => setFlash(null), 2000);
      }
      return true;
    } catch (e) {
      alert(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <div className="kyd">
        <p className="k-muted center">{error ? "Can't reach the server… retrying" : "Loading…"}</p>
      </div>
    );
  }

  const { state, requests, reactions, moods } = data;
  const steps = state.steps;
  const curIdx = steps.findIndex((s) => s.id === state.currentId);
  const cur = steps[curIdx];
  const next = curIdx >= 0 ? steps[curIdx + 1] : state.status === "waiting" ? steps[0] : null;
  const curEntered = [...state.history].reverse().find((h) => h.stepId === state.currentId)?.startedAt;
  const openRequests = requests.filter((r) => !r.handled).reverse();
  const byId = Object.fromEntries(state.backups.map((b) => [b.id, b]));
  const lastReaction = [...reactions].reverse().find((r) => r.stepId === state.currentId);
  const revealed = cur && state.revealed[cur.id];

  const statusLabel = state.status === "started" && state.paused ? "Paused" : STATUS_LABEL[state.status];

  return (
    <div className="kyd">
      <header className="k-head">
        <div>
          <p className="k-kicker">Tonight with Jess</p>
          <span className={`k-pill k-${state.paused ? "paused" : state.status}`}>{statusLabel}</span>
        </div>
        <button className="k-icon" onClick={() => setSheet({ type: "menu" })} aria-label="menu">
          ⋯
        </button>
      </header>

      {state.status === "waiting" && (
        <>
          <section className="k-card k-hero">
            <p className="k-label">Status</p>
            <p className="k-big">Waiting for Jess</p>
            <p className="k-muted">Her page says "Your night isn't ready yet." Tap the button when she's actually here.</p>
            <button
              className="k-btn k-here"
              disabled={busy}
              onClick={() => window.confirm("Jess is here? This starts the night on her phone.") && act({ type: "start" }, "The night has started 🩷")}
            >
              JESS IS HERE 🩷
            </button>
          </section>
          {next && (
            <section className="k-card">
              <p className="k-label">First thing she'll see</p>
              <p className="k-title">{next.title}</p>
              {next.hostNotes && <p className="k-note">{next.hostNotes}</p>}
            </section>
          )}
          <JessLink />
        </>
      )}

      {state.status === "started" && (
        <>
          {openRequests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              byId={byId}
              busy={busy}
              onUse={(backupId) => act({ type: "useBackup", backupId, mode: "next", requestId: r.id }, "Added as the next stop ✓")}
              onChoose={() => setSheet({ type: "backup", requestId: r.id, categories: moods[r.mood]?.categories })}
              onIgnore={() => act({ type: "handleRequest", requestId: r.id, result: "ignored" })}
            />
          ))}

          <section className="k-stats">
            <div>
              <span className="k-label">Started</span>
              <strong>{fmtTime(state.startedAt)}</strong>
            </div>
            <div>
              <span className="k-label">Elapsed</span>
              <strong>{mins(now - state.startedAt)}</strong>
            </div>
            <div>
              <span className="k-label">This step</span>
              <strong>
                {mins(now - curEntered)}
                {cur?.estimatedMinutes ? <small> / ~{cur.estimatedMinutes}</small> : null}
              </strong>
            </div>
          </section>

          {cur && (
            <section className="k-card k-now">
              <div className="k-row">
                <p className="k-label">
                  Now · {curIdx + 1} of {steps.length} · {cur.status}
                </p>
                {cur.destination && <span className={`k-tag ${revealed ? "k-tag-on" : ""}`}>{revealed ? "revealed" : "hidden from Jess"}</span>}
              </div>
              <p className="k-title">{cur.title}</p>
              {cur.destination && <Destination d={cur.destination} />}
              {cur.hostNotes && <p className="k-note">{cur.hostNotes}</p>}
              {lastReaction && (
                <p className="k-reaction">
                  Jess tapped "{lastReaction.text}" · {fmtTime(lastReaction.at)}
                </p>
              )}
            </section>
          )}

          <button className="k-btn k-primary k-advance" disabled={busy} onClick={() => act({ type: "advance" }, next ? "Story advanced →" : "Night finished 🩷")}>
            {next ? "ADVANCE STORY →" : "ADVANCE → FINALE"}
          </button>

          <div className="k-grid">
            <button
              className={`k-btn ${revealed ? "k-on" : ""}`}
              disabled={busy || !cur?.destination}
              onClick={() => act({ type: "reveal", hide: revealed }, revealed ? "Hidden again" : "Revealed on her phone ✨")}
            >
              {revealed ? "HIDE DESTINATION" : "REVEAL DESTINATION"}
            </button>
            <button className="k-btn" onClick={() => setSheet({ type: "clue" })}>SEND A CLUE</button>
            <button className="k-btn" onClick={() => setSheet({ type: "message" })}>SEND MESSAGE</button>
            <button className="k-btn" onClick={() => setSheet({ type: "backup" })}>CHANGE PLAN</button>
            <button className={`k-btn ${state.paused ? "k-on" : ""}`} disabled={busy} onClick={() => act({ type: "pause", paused: !state.paused }, state.paused ? "Resumed" : "Paused")}>
              {state.paused ? "RESUME" : "PAUSE"}
            </button>
            <button className="k-btn k-danger" disabled={busy} onClick={() => window.confirm("Finish the night now? She'll see the ending.") && act({ type: "finish" }, "Night finished 🩷")}>
              FINISH NIGHT
            </button>
          </div>

          {next && (
            <section className="k-card">
              <p className="k-label">Next planned</p>
              <p className="k-title">{next.title}</p>
              {next.destination && <Destination d={next.destination} compact />}
              <p className="k-muted">~{next.estimatedMinutes || "?"} min{next.hostNotes ? ` · ${next.hostNotes}` : ""}</p>
            </section>
          )}

          {state.message && (
            <p className="k-muted small">
              Last message: "{state.message.text}" · {fmtTime(state.message.at)}
            </p>
          )}
        </>
      )}

      {state.status === "finished" && (
        <section className="k-card k-hero">
          <p className="k-big">That's the night 🩷</p>
          <p className="k-muted">
            {fmtTime(state.startedAt)} → {fmtTime(state.finishedAt)} · {mins(state.finishedAt - state.startedAt)}
          </p>
          <p className="k-muted">Jess is looking at her scrapbook.</p>
        </section>
      )}

      <PlanList
        state={state}
        busy={busy}
        onSetSteps={(steps2, msg) => act({ type: "setSteps", steps: steps2 }, msg)}
        onGoto={(id) => window.confirm("Jump straight to this step?") && act({ type: "goto", stepId: id }, "Jumped ✓")}
        onEdit={(step) => setSheet({ type: "edit", step })}
        onAdd={() => setSheet({ type: "edit", step: null })}
      />

      <Feed requests={requests} reactions={reactions} />

      {flash && <div className="k-flash">{flash}</div>}

      {sheet?.type === "message" && (
        <TextSheet
          title="Send Jess a message"
          note="Pops up full-screen on her phone."
          presets={MESSAGE_PRESETS}
          onClose={() => setSheet(null)}
          onSend={async (text) => (await act({ type: "message", text }, "Sent to her phone ✓")) && setSheet(null)}
        />
      )}
      {sheet?.type === "clue" && (
        <TextSheet
          title="Send a clue"
          note="Shows up as a little sticky note on her current chapter."
          presets={CLUE_PRESETS}
          onClose={() => setSheet(null)}
          onSend={async (text) => (await act({ type: "clue", text }, "Clue sent ✓")) && setSheet(null)}
        />
      )}
      {sheet?.type === "backup" && (
        <BackupSheet
          state={state}
          categories={sheet.categories}
          hasCurrent={!!cur}
          onClose={() => setSheet(null)}
          onUse={async (backupId, mode) =>
            (await act({ type: "useBackup", backupId, mode, requestId: sheet.requestId }, mode === "replace" ? "Destination swapped ✓" : "Added as the next stop ✓")) && setSheet(null)
          }
        />
      )}
      {sheet?.type === "edit" && (
        <EditStepSheet
          step={sheet.step}
          onClose={() => setSheet(null)}
          onSave={async (step) => {
            const exists = steps.some((s) => s.id === step.id);
            const list = exists ? steps.map((s) => (s.id === step.id ? step : s)) : [...steps, step];
            if ((await act({ type: "setSteps", steps: list }, "Saved ✓")) !== false) setSheet(null);
          }}
        />
      )}
      {sheet?.type === "menu" && (
        <div className="k-sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="k-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="k-title">Settings</p>
            <JessLink />
            <button
              className="k-btn k-danger wide"
              onClick={() => window.confirm("Reset EVERYTHING back to waiting? Her scrapbook and your plan edits are wiped.") && act({ type: "reset" }, "Reset ✓").then(() => setSheet(null))}
            >
              Reset night
            </button>
            <button className="k-btn wide" onClick={onLock}>Lock Control Room</button>
            <p className="k-muted small">Session: {sessionId}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Destination({ d, compact }) {
  return (
    <div className="k-dest">
      <p className="k-dest-name">📍 {d.name}</p>
      {!compact && (
        <>
          {d.address && <p className="k-muted">{d.address}</p>}
          <p className="k-muted">
            {[d.openUntil && `open until ${d.openUntil}`, d.costLevel].filter(Boolean).join(" · ")}
          </p>
          {d.mapsLink && (
            <a className="k-link" href={d.mapsLink} target="_blank" rel="noreferrer">
              Open in Maps →
            </a>
          )}
        </>
      )}
    </div>
  );
}

function RequestCard({ request, byId, busy, onUse, onChoose, onIgnore }) {
  const [pick, setPick] = useState(0);
  const options = request.suggestions.map((id) => byId[id]).filter(Boolean);
  const suggested = options[pick];
  const others = options.filter((_, i) => i !== pick).slice(0, 3);
  const surprise = request.mood === "surprise";
  return (
    <section className="k-card k-request">
      <p className="k-label">{fmtTime(request.at)}</p>
      {surprise ? (
        <p className="k-big">Jess chose FULL SURPRISE MODE.</p>
      ) : (
        <>
          <p className="k-label">Jess requested</p>
          <p className="k-big">
            {request.emoji} {request.label}
          </p>
        </>
      )}
      {suggested && (
        <div className="k-suggest">
          <p className="k-label">{surprise ? "Recommended next" : "Suggested switch"}</p>
          <p className="k-title">{suggested.name}</p>
          <p className="k-muted">
            {suggested.description} · ~{suggested.estimatedDuration} min · {suggested.costLevel} · open until {suggested.openUntil}
          </p>
          {suggested.reasonJessMightLikeIt && <p className="k-note">Why: {suggested.reasonJessMightLikeIt}</p>}
        </div>
      )}
      {others.length > 0 && (
        <div className="k-chips">
          <span className="k-label">Other backups</span>
          {others.map((b) => (
            <button key={b.id} className="k-chip" onClick={() => setPick(options.indexOf(b))}>
              {b.name}
            </button>
          ))}
        </div>
      )}
      <div className="k-col">
        {suggested && (
          <button className="k-btn k-primary" disabled={busy} onClick={() => onUse(suggested.id)}>
            USE THIS PLAN
          </button>
        )}
        <button className="k-btn" onClick={onChoose}>CHOOSE ANOTHER</button>
        <button className="k-btn k-ghost" disabled={busy} onClick={onIgnore}>IGNORE / KEEP CURRENT PLAN</button>
      </div>
    </section>
  );
}

function Feed({ requests, reactions }) {
  const items = [
    ...reactions.map((r) => ({ at: r.at, text: `Jess tapped "${r.text}"` })),
    ...requests.map((r) => ({ at: r.at, text: r.mood === "surprise" ? "Jess: full surprise mode" : `Jess asked for: ${r.label}${r.handled ? ` (${r.handled})` : ""}` })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);
  if (!items.length) return null;
  return (
    <details className="k-card">
      <summary className="k-summary">From Jess's phone</summary>
      <ul className="k-feed">
        {items.map((it, i) => (
          <li key={i}>
            <span className="k-muted">{fmtTime(it.at)}</span> {it.text}
          </li>
        ))}
      </ul>
    </details>
  );
}

function JessLink() {
  const link = `${window.location.origin}/jess${sessionId !== "tonight" ? `?s=${encodeURIComponent(sessionId)}` : ""}`;
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(link, { type: "svg", margin: 1, color: { dark: "#3a1f33", light: "#fff7f2" } }).then(setSvg);
  }, [link]);
  const share = () => (navigator.share ? navigator.share({ url: link }).catch(() => {}) : navigator.clipboard?.writeText(link));
  return (
    <section className="k-card k-jesslink">
      <p className="k-label">Jess's link</p>
      <div className="k-qr" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="k-mono">{link}</p>
      <button className="k-btn wide" onClick={share}>Share / copy link</button>
    </section>
  );
}
