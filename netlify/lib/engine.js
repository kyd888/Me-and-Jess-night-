/**
 * The night's logic: pure functions, no storage, no HTTP.
 * Used by the Netlify Functions and by the local dev server.
 *
 * Nothing here is timer-based. The night only moves when Kyd does something.
 */
import { backups as defaultBackups, moods, settings, steps as defaultSteps } from "../../data/plan.js";

const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => Math.random().toString(36).slice(2, 10);
const MAX_LIST = 60;

export function freshState(sessionId) {
  return {
    sessionId,
    status: "waiting", // waiting | started | finished
    paused: false,
    startedAt: null,
    finishedAt: null,
    currentId: null,
    steps: clone(defaultSteps),
    backups: clone(defaultBackups),
    history: [], // [{ stepId, startedAt, endedAt }]
    revealed: {}, // { [stepId]: true }
    clues: [], // [{ id, stepId, text, at }]
    message: null, // { id, text, at }
    scrapbook: [], // [{ stepId, label, title, line, at }]
    handled: {}, // { [requestId]: "used" | "ignored" }
    usedBackups: [],
    rev: 0,
    updatedAt: Date.now(),
  };
}

export const freshJess = () => ({ requests: [], reactions: [] });

const indexOf = (state, id) => state.steps.findIndex((s) => s.id === id);
export const currentStep = (state) => state.steps.find((s) => s.id === state.currentId) || null;
export const nextStep = (state) => {
  const i = indexOf(state, state.currentId);
  return i === -1 ? null : state.steps[i + 1] || null;
};

/** Close the current step and stick a ticket in Jess's scrapbook. */
function completeCurrent(state, now) {
  const step = currentStep(state);
  if (!step) return;
  const open = [...state.history].reverse().find((h) => h.stepId === step.id && !h.endedAt);
  if (open) open.endedAt = now;
  if (state.scrapbook.some((s) => s.stepId === step.id)) return;
  const revealed = !!state.revealed[step.id];
  state.scrapbook.push({
    stepId: step.id,
    label: step.stamp || `Stop ${String(state.scrapbook.length + 1).padStart(2, "0")}`,
    title: step.memory || step.destination?.name || step.title,
    line: step.destination && !revealed ? "you weren't supposed to know about this" : "completed ✓",
    at: open?.startedAt || now,
  });
}

function enter(state, stepId, now) {
  state.currentId = stepId;
  state.history.push({ stepId, startedAt: now, endedAt: null });
}

function stepFromBackup(b) {
  return {
    id: `${b.id}-${uid()}`,
    status: "at_destination",
    eyebrow: "Change of plans",
    animation: "sparkle",
    title: "New plan unlocked.",
    body: "Kyd's got it. Just ride along.",
    button: "okay 👀",
    stamp: "Plot twist",
    estimatedMinutes: b.estimatedDuration || 45,
    hostNotes: b.reasonJessMightLikeIt || "",
    allowChange: true,
    fromBackup: b.id,
    destination: {
      name: b.name,
      note: b.jessNote || "",
      address: b.address || "",
      mapsLink: b.mapsLink || "",
      openUntil: b.openUntil || "",
      costLevel: b.costLevel || "",
    },
  };
}

/** Kyd's actions. Returns the new state (or throws on a bad action). */
export function applyHostAction(prev, action, now = Date.now()) {
  const state = clone(prev);
  const cur = currentStep(state);

  switch (action.type) {
    case "start": {
      if (state.status !== "waiting") break;
      state.status = "started";
      state.startedAt = now;
      if (state.steps[0]) enter(state, state.steps[0].id, now);
      break;
    }
    case "advance": {
      if (state.status !== "started") break;
      const next = nextStep(state);
      completeCurrent(state, now);
      if (next) enter(state, next.id, now);
      else finish(state, now);
      break;
    }
    case "goto": {
      if (state.status !== "started" || action.stepId === state.currentId) break;
      if (indexOf(state, action.stepId) === -1) throw new Error("No such step");
      completeCurrent(state, now);
      enter(state, action.stepId, now);
      break;
    }
    case "finish": {
      if (state.status !== "started") break;
      completeCurrent(state, now);
      finish(state, now);
      break;
    }
    case "pause":
      state.paused = !!action.paused;
      break;
    case "reveal": {
      const id = action.stepId || state.currentId;
      if (!id) break;
      if (action.hide) delete state.revealed[id];
      else state.revealed[id] = true;
      break;
    }
    case "clue": {
      const text = String(action.text || "").trim().slice(0, 200);
      if (!text) break;
      state.clues.push({ id: uid(), stepId: state.currentId, text, at: now });
      state.clues = state.clues.slice(-MAX_LIST);
      break;
    }
    case "message": {
      const text = String(action.text || "").trim().slice(0, 200);
      if (!text) break;
      state.message = { id: uid(), text, at: now };
      break;
    }
    case "clearMessage":
      state.message = null;
      break;
    case "handleRequest":
      state.handled[action.requestId] = action.result || "ignored";
      break;
    case "useBackup": {
      const b = state.backups.find((x) => x.id === action.backupId);
      if (!b) throw new Error("No such backup");
      const step = stepFromBackup(b);
      if (action.mode === "replace" && cur) {
        // Swap where we're going, keep the chapter wording.
        cur.destination = step.destination;
        cur.fromBackup = b.id;
        delete state.revealed[cur.id];
      } else {
        const i = indexOf(state, state.currentId);
        state.steps.splice(i + 1, 0, step);
      }
      if (!state.usedBackups.includes(b.id)) state.usedBackups.push(b.id);
      if (action.requestId) state.handled[action.requestId] = "used";
      break;
    }
    case "setSteps": {
      if (!Array.isArray(action.steps)) throw new Error("steps must be an array");
      const steps = action.steps.filter((s) => s && s.id);
      if (state.currentId && !steps.some((s) => s.id === state.currentId)) {
        throw new Error("Can't remove the step you're on");
      }
      state.steps = steps;
      break;
    }
    case "reset":
      return { ...freshState(state.sessionId), rev: state.rev + 1, updatedAt: now };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }

  state.rev += 1;
  state.updatedAt = now;
  return state;
}

function finish(state, now) {
  state.status = "finished";
  state.finishedAt = now;
  state.paused = false;
  state.currentId = null;
}

/** Jess's actions: written to her own record so they never clash with Kyd's. */
export function applyJessAction(prev, action, now = Date.now()) {
  const jess = clone(prev);
  if (action.type === "request") {
    if (!moods[action.mood]) throw new Error("Unknown mood");
    jess.requests.push({ id: uid(), mood: action.mood, stepId: action.stepId || null, at: now });
    jess.requests = jess.requests.slice(-MAX_LIST);
  } else if (action.type === "react") {
    jess.reactions.push({ id: uid(), stepId: action.stepId || null, text: String(action.text || "").slice(0, 80), at: now });
    jess.reactions = jess.reactions.slice(-MAX_LIST);
  } else {
    throw new Error(`Unknown action: ${action.type}`);
  }
  return jess;
}

/** Sky goes from light sunset pink → deep pink/purple night as chapters pass. */
function phaseFor(state) {
  if (state.status === "waiting") return 0;
  if (state.status === "finished") return 4;
  const i = Math.max(0, indexOf(state, state.currentId));
  const n = Math.max(1, state.steps.length - 1);
  return Math.min(4, 1 + Math.floor((i / n) * 3.2));
}

/**
 * Exactly what Jess's phone is allowed to know. No future steps, no
 * host notes, no addresses, no destination until Kyd reveals it.
 */
export function guestView(state, jess = freshJess()) {
  const step = state.status === "started" ? currentStep(state) : null;
  const revealed = step ? !!state.revealed[step.id] : false;
  return {
    status: state.status,
    paused: state.paused,
    nightId: state.startedAt || 0,
    rev: state.rev,
    phase: phaseFor(state),
    her: settings.her,
    me: settings.me,
    step: step && {
      id: step.id,
      eyebrow: step.eyebrow || "",
      title: step.title || "",
      body: step.body || "",
      hint: step.hint || "",
      button: step.button || "",
      animation: step.animation || "bird",
      allowChange: step.allowChange !== false,
      revealed,
      destination: revealed && step.destination ? { name: step.destination.name, note: step.destination.note || "" } : null,
      clues: state.clues.filter((c) => c.stepId === step.id).map(({ id, text }) => ({ id, text })),
      requested: jess.requests.some((r) => r.stepId === step.id),
    },
    scrapbook: state.scrapbook,
    message: state.message,
    finale: state.status === "finished" ? settings.finale : null,
  };
}

/** Pick backups for a request: matching categories first, unused first. */
export function suggestionsFor(state, mood) {
  let cats = moods[mood]?.categories || [];
  if (!cats.length) {
    // "Just surprise me": suggest something that fits where the night is.
    const upcoming = nextStep(state) || currentStep(state);
    const byStatus = { at_home: ["RANDOM", "GAMES"], leaving: ["GAMES", "COZY"], at_destination: ["DINNER", "GAMES"], transition: ["COFFEE", "RANDOM"], dessert: ["DESSERT"], ending: ["AT HOME"] };
    cats = byStatus[upcoming?.status] || ["RANDOM", "DESSERT"];
  }
  const used = new Set(state.usedBackups);
  const inPlan = new Set(state.steps.map((s) => s.destination?.name).filter(Boolean));
  const ranked = state.backups
    .filter((b) => cats.includes(b.category))
    .sort((a, b) => {
      const score = (x) => (used.has(x.id) || inPlan.has(x.name) ? 1 : 0) + cats.indexOf(x.category) * 0.1;
      return score(a) - score(b);
    });
  return ranked.map((b) => b.id);
}

/** Everything the Control Room needs. */
export function hostView(state, jess = freshJess()) {
  const requests = jess.requests.map((r) => ({
    ...r,
    label: moods[r.mood]?.label,
    emoji: moods[r.mood]?.emoji,
    handled: state.handled[r.id] || null,
    suggestions: suggestionsFor(state, r.mood),
  }));
  return { state, requests, reactions: jess.reactions, moods, serverTime: Date.now() };
}
