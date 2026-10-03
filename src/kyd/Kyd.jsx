import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { fmtTime, hostApi, local, sessionId, usePoll } from "../lib/api.js";
import { CategorySheet, EditPlanSheet, PlanPickerSheet, TextSheet } from "./Sheets.jsx";
import Library from "./Library.jsx";
import "./kyd.css";

const MESSAGE_PRESETS = ["Time to go.", "Look at me 👀", "One more stop.", "Check the car.", "Trust me.", "Don't open that yet.", "Okay you can look now."];
const CLUE_PRESETS = ["it's close.", "you've never been here.", "it involves food.", "bring a jacket.", "you're gonna like this one.", "be so fr, you'll never guess 😭"];

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

/**
 * A soft two-note chime when Jess picks a card. iPhones don't support
 * vibration from websites, so this + the flashing panel is the alert.
 * Audio unlocks on your first tap anywhere in the Control Room.
 */
function useChime() {
  const ctx = useRef(null);
  useEffect(() => {
    const unlock = () => {
      try {
        ctx.current = ctx.current || new (window.AudioContext || window.webkitAudioContext)();
        ctx.current.resume?.();
      } catch {
        /* no audio, no problem */
      }
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
  return () => {
    navigator.vibrate?.([120, 60, 120]);
    const c = ctx.current;
    if (!c) return;
    [880, 1320].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, c.currentTime + i * 0.16);
      g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + i * 0.16 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.16 + 0.35);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + i * 0.16);
      o.stop(c.currentTime + i * 0.16 + 0.4);
    });
  };
}

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
        <input className="pin-input" type="password" inputMode="numeric" autoComplete="current-password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
        <button className="k-btn k-primary" disabled={!pin || busy}>{busy ? "…" : "Unlock"}</button>
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
  const { data, setData, error } = usePoll(() => hostApi.get(pin), 2000);
  const [sheet, setSheet] = useState(null);
  const [flash, setFlash] = useState(null);
  const [busy, setBusy] = useState(false);
  const [justPicked, setJustPicked] = useState(false);
  const lastPick = useRef(undefined);
  const chime = useChime();
  const now = useNow();

  useEffect(() => {
    if (error?.status === 401) onLock();
  }, [error, onLock]);

  // Jess just flipped a card → chime + highlight.
  useEffect(() => {
    if (!data) return;
    const key = data.pick ? `${data.state.round?.id}-${data.pick.cardId}` : null;
    if (lastPick.current !== undefined && key && key !== lastPick.current) {
      chime();
      setJustPicked(true);
      setTimeout(() => setJustPicked(false), 8000);
    }
    lastPick.current = key;
  }, [data, chime]);

  const say = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(null), 2000);
  };

  const act = async (action, okText) => {
    setBusy(true);
    try {
      setData(await hostApi.send(pin, action));
      if (okText) say(okText);
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

  const { state, pick, activePlanId, nextPreview, categoryOptions, categories, requests, reactions, yourCallOptions = [], prefs, lengths, dateComplete, areas = [] } = data;
  const planById = Object.fromEntries(state.plans.map((p) => [p.id, p]));
  const round = state.round;
  const plan = activePlanId ? planById[activePlanId] : null;
  const openRequests = requests.filter((r) => !r.handled).reverse();
  const lastReaction = reactions[reactions.length - 1];
  const statusLabel = state.status === "started" ? (state.paused ? "Paused" : "Date in progress") : state.status === "waiting" ? "Waiting for Jess" : "Night finished";
  const partStarted = round ? (pick ? pick.at : round.createdAt) : state.lastBeatAt;
  const catLabel = (id) => (id ? `${categories[id]?.icon} ${id}` : "—");

  return (
    <div className="kyd">
      <header className="k-head">
        <div>
          <p className="k-kicker">Tonight with Jess</p>
          <span className={`k-pill k-${state.paused ? "paused" : state.status}`}>{statusLabel}</span>
        </div>
        <button className="k-icon" onClick={() => setSheet({ type: "menu" })} aria-label="menu">⋯</button>
      </header>

      <DateSettings prefs={prefs} lengths={lengths} areas={areas} started={state.status !== "waiting"} roundsDone={state.rounds.length} busy={busy} onChange={(p) => act({ type: "setPrefs", prefs: p }, "Saved ✓ (only affects what's next)")} />

      {/* ── Before she arrives ── */}
      {state.status === "waiting" && (
        <>
          <section className="k-card k-hero">
            <p className="k-label">Status</p>
            <p className="k-big">Waiting for Jess</p>
            <p className="k-muted">Her page says "Hey Jess. not yet 👀". Tap this when she's actually here.</p>
            <button className="k-btn k-here" disabled={busy} onClick={() => window.confirm("Jess is here? This starts the night on her phone.") && act({ type: "start" }, "The night has started 🩷")}>
              JESS IS HERE 🩷
            </button>
          </section>
          <JessLink />
        </>
      )}

      {state.status === "started" && (
        <>
          {openRequests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              planById={planById}
              busy={busy}
              onUse={(planId) =>
                pick
                  ? act({ type: "swapPlan", planId, requestId: r.id }, "Plan swapped ✓ (still secret)")
                  : act({ type: "handleRequest", requestId: r.id, result: "used" }).then(() => act({ type: "deal", category: planById[planId].category }, "Dealt new cards ✓"))
              }
              onChoose={() => setSheet({ type: "planPicker", requestId: r.id, suggested: r.suggestions })}
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
              <span className="k-label">This part</span>
              <strong>
                {mins(now - (partStarted || now))}
                {plan ? <small> / ~{plan.duration}</small> : null}
              </strong>
            </div>
          </section>

          {/* ── Opening beats ── */}
          {state.stage === "opening" && (
            <section className="k-card k-now">
              <p className="k-label">Opening · {state.openingIndex + 1} of {state.opening.length}</p>
              <p className="k-title">{state.opening[state.openingIndex]?.title}</p>
              <p className="k-note">{state.opening[state.openingIndex]?.hostNotes}</p>
              {lastReaction && <p className="k-reaction">Jess tapped "{lastReaction.text}" · {fmtTime(lastReaction.at)}</p>}
              <button className="k-btn k-primary k-advance" disabled={busy} onClick={() => act({ type: "nextBeat" }, "Next ✓")}>
                {state.openingIndex + 1 < state.opening.length ? "NEXT →" : "DONE WITH THE OPENING →"}
              </button>
            </section>
          )}

          {/* ── Between rounds: Generate next part? ── */}
          {state.stage === "between" && (
            <section className="k-card k-hero">
              {state.chilling ? (
                <>
                  <p className="k-big">Chilling 😌</p>
                  <p className="k-muted">Nothing new gets dealt. Her phone just says "phone down 😌".</p>
                  <button className="k-btn k-primary wide" disabled={busy} onClick={() => act({ type: "chill", on: false })}>Ready: what's next?</button>
                </>
              ) : dateComplete ? (
                <>
                  <p className="k-big">That's a complete date ✓</p>
                  <p className="k-muted">You hit the {lengths?.[prefs?.length]?.label?.toLowerCase()} date. Wrap it up whenever, or keep going.</p>
                  <div className="k-col">
                    <button className="k-btn k-primary k-advance" disabled={busy} onClick={() => window.confirm("End the date? She'll see a little ending + her scrapbook.") && act({ type: "finish" }, "Done 🩷")}>
                      END THE DATE 🩷
                    </button>
                    <button className="k-btn" onClick={() => act({ type: "chill", on: true })}>KEEP CHILLING</button>
                    <button className="k-btn" onClick={() => setSheet({ type: "category", mode: "deal" })}>ONE MORE ANYWAY</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="k-big">Generate next part?</p>
                  {nextPreview ? (
                    <p className="k-muted">
                      Next category: <strong className="k-pink">{catLabel(nextPreview)}</strong> · “{categories[nextPreview]?.label}”
                    </p>
                  ) : (
                    <p className="k-muted">Nothing fits anymore. Probably time to wrap up 🩷</p>
                  )}
                  <div className="k-col">
                    {nextPreview && (
                      <button className="k-btn k-primary k-advance" disabled={busy} onClick={() => act({ type: "deal" }, "Cards dealt to her phone 🃏")}>
                        YES
                      </button>
                    )}
                    <button className="k-btn" onClick={() => act({ type: "chill", on: true })}>KEEP CHILLING</button>
                    <button className="k-btn" onClick={() => setSheet({ type: "category", mode: "deal" })}>CHOOSE CATEGORY MYSELF</button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* ── Round: she's choosing ── */}
          {state.stage === "round" && round && !pick && (
            <section className="k-card k-now">
              <p className="k-label">Round {round.n} · {catLabel(round.category)}</p>
              <p className="k-big">Jess is choosing a card…</p>
              <p className="k-muted small">Under the cards (left → right on her screen):</p>
              <ol className="k-under">
                {round.cards.map((c) => (
                  <li key={c.id}>
                    <span className="k-face">{c.face.icon || c.face.text}</span> {planById[c.planId]?.name}
                  </li>
                ))}
              </ol>
              <div className="k-row gap">
                <button className="k-btn" disabled={busy} onClick={() => act({ type: "reshuffle" }, "Reshuffled ✓")}>RESHUFFLE</button>
                <button className="k-btn" onClick={() => setSheet({ type: "category", mode: "reshuffle" })}>CHANGE CATEGORY</button>
              </div>
            </section>
          )}

          {/* ── Round: she picked ── */}
          {state.stage === "round" && round && pick && plan && (
            <section className={`k-card k-picked ${justPicked ? "is-new" : ""}`}>
              <p className="k-kicker">Jess picked a card</p>
              <p className="k-label">Category</p>
              <p className="k-title">{catLabel(round.category)} · “{categories[round.category]?.label}”</p>
              <p className="k-label">Plan</p>
              <p className="k-big">{plan.icon} {plan.name}</p>
              {plan.wildcard && (
                <div className="k-yourcall">
                  <p className="k-note">She picked YOUR CALL. Read the vibe and pick something. It stays secret on her phone ("you'll see 👀").</p>
                  <button className="k-btn k-primary wide" onClick={() => setSheet({ type: "planPicker", startCategory: round.category, suggested: yourCallOptions })}>
                    PICK THE PLAN
                  </button>
                </div>
              )}
              {round.swappedPlanId && <span className="k-tag">swapped by you</span>}
              <dl className="k-facts">
                <dt>Place</dt>
                <dd>{plan.place}</dd>
                <dt>Address</dt>
                <dd>{plan.address || "—"}</dd>
                <dt>Travel</dt>
                <dd>{plan.travel || "check Maps"}</dd>
                <dt>Duration</dt>
                <dd>~{plan.duration} min</dd>
                <dt>Cost</dt>
                <dd>{plan.cost}</dd>
                {plan.closesAt && (
                  <>
                    <dt>Closes</dt>
                    <dd>{plan.closesAt} (verify)</dd>
                  </>
                )}
                <dt>She sees</dt>
                <dd>{round.revealedFull ? "full" : round.swappedPlanId ? "\"plot twist 😭\"" : plan.revealMode}</dd>
              </dl>
              {plan.hostNotes && <p className="k-note">What to do: {plan.hostNotes}</p>}
              {lastReaction?.roundId === round.id && <p className="k-reaction">Jess tapped "{lastReaction.text}"</p>}
              <div className="k-col">
                {plan.mapsLink && (
                  <a className="k-btn k-primary k-linkbtn" href={plan.mapsLink} target="_blank" rel="noreferrer">OPEN DIRECTIONS</a>
                )}
                {(plan.revealMode !== "full" || round.swappedPlanId) && (
                  <button className={`k-btn ${round.revealedFull ? "k-on" : ""}`} disabled={busy} onClick={() => act({ type: "revealFull", hide: round.revealedFull }, round.revealedFull ? "Back to secret" : "Revealed on her phone ✨")}>
                    {round.revealedFull ? "HIDE FULL REVEAL" : "REVEAL FULL PLAN TO JESS"}
                  </button>
                )}
                <button className="k-btn" onClick={() => setSheet({ type: "planPicker", startCategory: round.category })}>
                  CHANGE PLAN{plan.backup && planById[plan.backup] ? ` (backup: ${planById[plan.backup].name})` : ""}
                </button>
              </div>
              {round.cards.length > 1 && (
                <p className="k-muted small">
                  She passed on:{" "}
                  {round.cards
                    .filter((c) => c.id !== pick.cardId)
                    .map((c) => planById[c.planId]?.name)
                    .join(", ")}
                </p>
              )}
              <p className="k-muted">
                Next possible category: <strong className="k-pink">{catLabel(nextPreview)}</strong>
              </p>
              {state.chilling ? (
                <p className="k-chill">Chilling 😌 no rush. <button className="k-linklike" onClick={() => act({ type: "chill", on: false })}>stop</button></p>
              ) : (
                <button className="k-btn wide" disabled={busy} onClick={() => act({ type: "chill", on: true }, "Chilling. Take your time.")}>
                  KEEP CHILLING 😌
                </button>
              )}
              <button className="k-btn k-primary k-advance" disabled={busy} onClick={() => window.confirm("Done with this one? It goes in her scrapbook.") && act({ type: "finishRound" }, "Added to her scrapbook 🎟️")}>
                WE FINISHED THIS ✓
              </button>
            </section>
          )}

          <div className="k-grid">
            <button className="k-btn" onClick={() => setSheet({ type: "clue" })}>SEND A CLUE</button>
            <button className="k-btn" onClick={() => setSheet({ type: "message" })}>SEND MESSAGE</button>
            <button className={`k-btn ${state.paused ? "k-on" : ""}`} disabled={busy} onClick={() => act({ type: "pause", paused: !state.paused }, state.paused ? "Resumed" : "Paused")}>
              {state.paused ? "RESUME" : "PAUSE"}
            </button>
            <button className="k-btn k-danger" disabled={busy} onClick={() => window.confirm("Finish the night now? She'll see the ending + her scrapbook.") && act({ type: "finish" }, "Night finished 🩷")}>
              FINISH NIGHT
            </button>
          </div>

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
          <ol className="k-under">
            {state.rounds.map((r) => (
              <li key={r.id}>
                {fmtTime(r.pick?.at)} · {planById[r.planId]?.name}
              </li>
            ))}
          </ol>
        </section>
      )}

      {state.rounds.length > 0 && state.status === "started" && (
        <details className="k-card">
          <summary className="k-summary">Done so far ({state.rounds.length})</summary>
          <ol className="k-under">
            {state.rounds.map((r) => (
              <li key={r.id}>
                {fmtTime(r.pick?.at)} · {catLabel(r.category)} · {planById[r.planId]?.name}
              </li>
            ))}
          </ol>
        </details>
      )}

      <Library
        state={state}
        categories={categories}
        busy={busy}
        onToggle={(p) => act({ type: "savePlan", plan: { ...p, enabled: p.enabled === false } }, p.enabled === false ? "Turned on" : "Turned off")}
        onEdit={(p) => setSheet({ type: "edit", plan: p })}
        onAdd={() => setSheet({ type: "edit", plan: null })}
      />

      <Feed requests={requests} reactions={reactions} />

      {flash && <div className="k-flash">{flash}</div>}

      {sheet?.type === "message" && (
        <TextSheet title="Send Jess a message" note="Pops up full-screen on her phone." presets={MESSAGE_PRESETS} onClose={() => setSheet(null)} onSend={async (text) => (await act({ type: "message", text }, "Sent to her phone ✓")) && setSheet(null)} />
      )}
      {sheet?.type === "clue" && (
        <TextSheet title="Send a clue" note="Shows up as a little sticky note on her screen." presets={CLUE_PRESETS} onClose={() => setSheet(null)} onSend={async (text) => (await act({ type: "clue", text }, "Clue sent ✓")) && setSheet(null)} />
      )}
      {sheet?.type === "category" && (
        <CategorySheet
          options={categoryOptions}
          title={sheet.mode === "reshuffle" ? "Deal a different category" : "Choose category"}
          onClose={() => setSheet(null)}
          onPick={async (category) =>
            (await act({ type: sheet.mode === "reshuffle" ? "reshuffle" : "deal", category }, "Cards dealt to her phone 🃏")) && setSheet(null)
          }
        />
      )}
      {sheet?.type === "planPicker" && (
        <PlanPickerSheet
          state={state}
          categories={categories}
          startCategory={sheet.startCategory}
          suggested={sheet.suggested}
          actionLabel={pick ? "Swap to this" : "Deal this category"}
          onClose={() => setSheet(null)}
          onPick={async (planId) => {
            const ok = pick
              ? await act({ type: "swapPlan", planId, requestId: sheet.requestId }, "Plan swapped ✓ (still secret)")
              : await act({ type: "deal", category: planById[planId].category }, "Cards dealt 🃏");
            if (ok) setSheet(null);
          }}
        />
      )}
      {sheet?.type === "edit" && (
        <EditPlanSheet plan={sheet.plan} categories={categories} onClose={() => setSheet(null)} onSave={async (p) => (await act({ type: "savePlan", plan: p }, "Saved ✓")) && setSheet(null)} />
      )}
      {sheet?.type === "menu" && (
        <div className="k-sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="k-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="k-title">Settings</p>
            <JessLink />
            <button className="k-btn k-danger wide" onClick={() => window.confirm("Reset EVERYTHING back to waiting? Her scrapbook and your edits are wiped.") && act({ type: "reset" }, "Reset ✓").then(() => setSheet(null))}>
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

const CITIES = [
  ["TULSA", "Tulsa"],
  ["OKC", "Oklahoma City"],
  ["CUSTOM", "Custom"],
];
const ENERGIES = [
  ["CHILL", "Very chill"],
  ["NORMAL", "Normal"],
  ["ACTIVE", "Let's do something"],
];
const VIBE_OPTIONS = [
  ["HUNGRY", "🍜 Hungry"],
  ["SWEET", "🍦 Sweet"],
  ["COFFEE", "☕ Coffee"],
  ["GAME", "🎮 Game"],
  ["TALK", "💬 Talk"],
  ["RANDOM", "🎲 Random"],
  ["HOME", "🏠 Home"],
];

function Seg({ value, options, onPick, busy }) {
  return (
    <div className="k-seg">
      {options.map(([v, label]) => (
        <button key={v} className={`k-seg-btn ${value === v ? "is-on" : ""}`} disabled={busy} onClick={() => onPick(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Private settings. Change anytime; only what's dealt next changes. */
function DateSettings({ prefs, lengths, areas, started, roundsDone, busy, onChange }) {
  const [custom, setCustom] = useState(prefs?.customCity || "");
  if (!prefs || !lengths) return null;
  const L = lengths[prefs.length];
  const target = L && L.max ? `${L.min === L.max ? L.max : `${L.min}–${L.max}`} rounds` : "no target";
  return (
    <details className="k-card k-settings" open={!started}>
      <summary className="k-summary">
        {L?.label} · {prefs.city === "CUSTOM" ? prefs.customCity || "Custom" : prefs.city === "OKC" ? "OKC" : "Tulsa"} · {ENERGIES.find(([v]) => v === prefs.energy)?.[1]}
        {prefs.vibe ? ` · ${VIBE_OPTIONS.find(([v]) => v === prefs.vibe)?.[1]}` : ""}
      </summary>
      <p className="k-label">Date length · {roundsDone} done, {target}</p>
      <Seg busy={busy} value={prefs.length} options={Object.entries(lengths).map(([k, v]) => [k, `${v.label} · ${v.hint}`])} onPick={(length) => onChange({ length })} />

      <p className="k-label">City</p>
      <Seg busy={busy} value={prefs.city} options={CITIES} onPick={(city) => onChange({ city, area: "" })} />
      {prefs.city === "CUSTOM" && (
        <div className="k-row gap">
          <input className="k-input" placeholder="city name" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button className="k-btn" disabled={busy} onClick={() => onChange({ customCity: custom })}>Save</button>
          <p className="k-muted small">Custom city = only ideas that work anywhere (chains, drives, home-free stuff).</p>
        </div>
      )}
      {areas.length > 0 && (
        <>
          <p className="k-label">Where we are now (keeps stops close)</p>
          <Seg busy={busy} value={prefs.area || ""} options={[["", "Anywhere"], ...areas.map((a) => [a, a])]} onPick={(area) => onChange({ area })} />
        </>
      )}

      <p className="k-label">Energy</p>
      <Seg busy={busy} value={prefs.energy} options={ENERGIES} onPick={(energy) => onChange({ energy })} />

      <p className="k-label">Current vibe</p>
      <Seg busy={busy} value={prefs.vibe || ""} options={[["", "None"], ...VIBE_OPTIONS]} onPick={(vibe) => onChange({ vibe: vibe || null })} />

      {!started && (
        <label className="k-check">
          <input type="checkbox" checked={prefs.opening} disabled={busy} onChange={(e) => onChange({ opening: e.target.checked })} /> Start with the opening ("come inside" + flowers)
        </label>
      )}
      <p className="k-muted small">Jess never sees any of this.</p>
    </details>
  );
}

function RequestCard({ request, planById, busy, onUse, onChoose, onIgnore }) {
  const [i, setI] = useState(0);
  const options = request.suggestions.map((id) => planById[id]).filter(Boolean);
  const suggested = options[i];
  const others = options.filter((_, j) => j !== i).slice(0, 3);
  const surprise = request.mood === "surprise";
  return (
    <section className="k-card k-request">
      <p className="k-label">{fmtTime(request.at)}</p>
      {surprise ? (
        <p className="k-big">Jess chose FULL SURPRISE MODE.</p>
      ) : (
        <>
          <p className="k-label">Jess requested</p>
          <p className="k-big">{request.emoji} {request.label}</p>
        </>
      )}
      {suggested && (
        <div className="k-suggest">
          <p className="k-label">{surprise ? "Recommended next" : "Suggested switch"}</p>
          <p className="k-title">{suggested.icon} {suggested.name}</p>
          <p className="k-muted">
            {suggested.place} · ~{suggested.duration} min · {suggested.cost}
            {suggested.closesAt ? ` · closes ${suggested.closesAt}` : ""}
          </p>
          {suggested.hostNotes && <p className="k-note">{suggested.hostNotes}</p>}
        </div>
      )}
      {others.length > 0 && (
        <div className="k-chips">
          <span className="k-label">Other backups</span>
          {others.map((b) => (
            <button key={b.id} className="k-chip" onClick={() => setI(options.indexOf(b))}>{b.name}</button>
          ))}
        </div>
      )}
      <div className="k-col">
        {suggested && (
          <button className="k-btn k-primary" disabled={busy} onClick={() => onUse(suggested.id)}>USE THIS PLAN</button>
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
