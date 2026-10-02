/**
 * The night's logic: pure functions, no storage, no HTTP.
 * Used by the Netlify Functions and by the local dev server.
 *
 * Nothing here is timer-based. Rounds only change when Kyd says so.
 */
import { categories, copy, moods, opening, plans as defaultPlans, settings } from "../../data/plan.js";

const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => Math.random().toString(36).slice(2, 10);
const MAX_LIST = 60;
const pickOne = (arr, rand = Math.random) => arr[Math.floor(rand() * arr.length)];

/** Small seeded RNG so previews are stable between polls. */
function seeded(seedStr) {
  let h = 2166136261;
  for (const c of String(seedStr)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── State ────────────────────────────────────────────────

export function freshState(sessionId) {
  return {
    sessionId,
    status: "waiting", // waiting | started | finished
    stage: "opening", // opening | between | round
    paused: false,
    startedAt: null,
    finishedAt: null,
    openingIndex: 0,
    opening: clone(opening),
    plans: clone(defaultPlans),
    round: null, // the live round (see dealRound)
    rounds: [], // finished rounds
    nextCategory: null, // what YES will deal next (shown to Kyd)
    scrapbook: [],
    clues: [],
    message: null,
    handled: {},
    rev: 0,
    updatedAt: Date.now(),
  };
}

export const freshJess = () => ({ requests: [], reactions: [], picks: {} });

// ── Time (Tulsa time, not the server's) ──────────────────

function localMinutes(now) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: settings.timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date(now));
  const h = Number(parts.find((p) => p.type === "hour").value);
  const m = Number(parts.find((p) => p.type === "minute").value);
  return (h < 5 ? h + 24 : h) * 60 + m; // after midnight counts as "late", not "early"
}

const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return (h < 5 ? h + 24 : h) * 60 + (m || 0);
};

/** Open long enough to be worth going (at least 30 min left, or half the plan). */
function isOpen(plan, now) {
  const close = toMinutes(plan.closesAt);
  if (close === null) return true;
  return close - localMinutes(now) >= Math.min(30, plan.duration || 30);
}

// ── Sequencing ───────────────────────────────────────────

/** Seeds are tied to this particular night, so every night plays out differently. */
const seedFor = (state, n) => `${state.sessionId}-${state.startedAt}-${n}`;

const finishedPlans = (state) => state.rounds.map((r) => r.planId);
const usedPlanIds = (state) => new Set([...finishedPlans(state), ...(state.round ? state.round.cards.map((c) => c.planId) : [])]);
const mealsDone = (state) => state.rounds.filter((r) => state.plans.find((p) => p.id === r.planId)?.meal).length;

export function availablePlans(state, category, now, { includeUsed = false } = {}) {
  const used = new Set(finishedPlans(state));
  const hungry = mealsDone(state) === 0;
  return state.plans.filter(
    (p) =>
      p.category === category &&
      p.enabled !== false &&
      (includeUsed || !used.has(p.id)) &&
      isOpen(p, now) &&
      // Long things (movies, drive-in) wait until after she's eaten.
      !(hungry && !p.meal && (p.duration || 0) > 75)
  );
}

/**
 * Which categories make sense right now, and why the others don't.
 * `history` = categories already done, oldest first.
 */
export function categoryOptions(state, now, history = state.rounds.map((r) => r.category)) {
  const last = history[history.length - 1];
  const lastGroup = last && categories[last]?.group;
  const count = (c) => history.filter((h) => h === c).length;
  const meals = mealsDone(state);
  const t = localMinutes(now);
  const done = history.length;

  return Object.keys(categories).map((id) => {
    const cat = categories[id];
    let reason = null;
    let weight = 1;

    if (id === last) reason = "just did this";
    else if (cat.group === lastGroup) weight *= 0.25;

    if (id === "FOOD" && meals >= 1) reason = reason || "already had a meal";
    if (id === "SWEET" && count("SWEET") >= 1) reason = reason || "already had dessert";
    if (id === "SWEET" && meals === 0 && done < 3) reason = reason || "dessert comes after food";
    if (id === "HOME" && done < 3 && t < 21 * 60 + 30) reason = reason || "too early for home";
    if (id === "QUICK" && done === 0) weight *= 0.3;
    if (count(id) >= 1 && id !== "QUICK") weight *= 0.35;

    // Hunger: the later it gets without a meal, the more FOOD wants to happen.
    if (id === "FOOD" && meals === 0) weight *= t >= 19 * 60 + 30 ? 25 : t >= 19 * 60 ? 8 : done >= 1 ? 4 : 1.5;
    if (id === "SWEET" && meals >= 1) weight *= 1.8;
    // Once you're home, the night is winding down (dessert is still allowed).
    if (history.includes("HOME") && id !== "SWEET") reason = reason || "you're already home";
    // Late: wind down.
    if (t >= 22 * 60) {
      if (["HOME", "COZY", "SWEET", "CHILL"].includes(id)) weight *= 2.5;
      if (["ADVENTURE", "FUN", "FOOD"].includes(id)) weight *= 0.4;
    }
    if (id === "HOME" && !reason) weight *= done >= 4 ? 3 : 1;

    const available = availablePlans(state, id, now).length;
    if (!reason && available === 0) reason = "nothing open / left";
    if (!reason && available === 1) reason = "only 1 option open (you can still force it)";

    return { id, label: cat.label, icon: cat.icon, eligible: !reason, reason, weight: reason ? 0 : weight, available };
  });
}

export function chooseCategory(state, now, seed, history) {
  const opts = categoryOptions(state, now, history).filter((o) => o.eligible);
  if (!opts.length) return null;
  const rand = seeded(seed);
  const total = opts.reduce((s, o) => s + o.weight, 0);
  let r = rand() * total;
  for (const o of opts) if ((r -= o.weight) <= 0) return o.id;
  return opts[opts.length - 1].id;
}

/**
 * The rare extra line under a reveal. Sweet more often than flirty,
 * and most reveals get nothing at all.
 */
function pickAside() {
  const roll = Math.random();
  if (roll < 0.18) return pickOne(copy.sweet);
  if (roll < 0.28) return pickOne(copy.flirty);
  return null;
}

/** Deal 2–4 different plans face-down (usually 3), shuffled, with random faces. */
function dealRound(state, category, now) {
  const pool = shuffle(availablePlans(state, category, now));
  if (!pool.length) throw new Error(`No open plans left in ${category}`);
  const roll = Math.random();
  const want = roll < 0.15 ? 2 : roll > 0.85 ? 4 : 3;
  const chosen = pool.slice(0, Math.min(want, pool.length));
  const faces = shuffle(copy.faces);
  return {
    id: uid(),
    n: state.rounds.length + 1,
    category,
    intro: pickOne(copy.roundIntros),
    cards: chosen.map((p, i) => ({ id: uid(), face: faces[i % faces.length], planId: p.id })),
    revealLine: pickOne(copy.revealLines),
    aside: pickAside(),
    createdAt: now,
    swappedPlanId: null,
    revealedFull: false,
  };
}

const roundPick = (round, jess) => (round ? jess.picks?.[round.id] || null : null);

/** The plan actually happening this round (after any swap). */
export function activePlanId(round, pick) {
  if (!round || !pick) return null;
  return round.swappedPlanId || round.cards.find((c) => c.id === pick.cardId)?.planId || null;
}

function stampOpening(state, now) {
  const beat = state.opening[state.openingIndex];
  if (!beat || state.scrapbook.some((s) => s.id === beat.id)) return;
  state.scrapbook.push({ id: beat.id, label: beat.stamp, category: "", title: beat.memory || beat.title, caption: "completed ✓", icon: "🩷", at: state.lastBeatAt || state.startedAt || now });
}

function finishRound(state, jess, now) {
  const round = state.round;
  const pick = roundPick(round, jess);
  if (!round) return;
  const planId = activePlanId(round, pick);
  if (planId) {
    const plan = state.plans.find((p) => p.id === planId);
    state.rounds.push({ ...round, pick, planId, finishedAt: now });
    state.scrapbook.push({
      id: round.id,
      label: `Card ${String(round.n).padStart(2, "0")}`,
      category: categories[round.category]?.label || "",
      title: plan?.place === "Home" ? plan.name : plan?.place || plan?.name || "",
      caption: plan?.caption || pickOne(copy.captions),
      icon: plan?.icon || "✦",
      at: pick.at,
    });
  }
  state.round = null;
  state.stage = "between";
  state.nextCategory = chooseCategory(state, now, seedFor(state, state.rounds.length));
}

// ── Kyd's actions ────────────────────────────────────────

export function applyHostAction(prev, action, jess = freshJess(), now = Date.now()) {
  const state = clone(prev);

  switch (action.type) {
    case "start": {
      if (state.status !== "waiting") break;
      state.status = "started";
      state.startedAt = now;
      state.lastBeatAt = now;
      state.stage = state.opening.length ? "opening" : "between";
      state.openingIndex = 0;
      if (!state.opening.length) state.nextCategory = chooseCategory(state, now, seedFor(state, 0));
      break;
    }
    case "nextBeat": {
      if (state.status !== "started" || state.stage !== "opening") break;
      stampOpening(state, now);
      state.openingIndex += 1;
      state.lastBeatAt = now;
      if (state.openingIndex >= state.opening.length) {
        state.stage = "between";
        state.nextCategory = chooseCategory(state, now, seedFor(state, 0));
      }
      break;
    }
    case "deal": {
      // YES (category omitted) or CHOOSE CATEGORY MYSELF (category given).
      if (state.status !== "started") break;
      if (state.round && roundPick(state.round, jess)) throw new Error("Finish the current card first");
      const category = action.category || state.nextCategory || chooseCategory(state, now, uid());
      if (!category) throw new Error("No categories left. Maybe it's time to finish the night 🩷");
      state.round = dealRound(state, category, now);
      state.stage = "round";
      break;
    }
    case "reshuffle": {
      if (!state.round || roundPick(state.round, jess)) throw new Error("She already picked");
      state.round = dealRound(state, action.category || state.round.category, now);
      break;
    }
    case "finishRound": {
      if (!state.round) break;
      if (!roundPick(state.round, jess)) throw new Error("She hasn't picked a card yet");
      finishRound(state, jess, now);
      break;
    }
    case "cancelRound": {
      state.round = null;
      state.stage = "between";
      break;
    }
    case "swapPlan": {
      if (!state.round || !roundPick(state.round, jess)) throw new Error("No picked card to change");
      if (!state.plans.some((p) => p.id === action.planId)) throw new Error("No such plan");
      state.round.swappedPlanId = action.planId;
      state.round.revealedFull = false;
      if (action.requestId) state.handled[action.requestId] = "used";
      break;
    }
    case "revealFull":
      if (state.round) state.round.revealedFull = !action.hide;
      break;
    case "finish": {
      if (state.status !== "started") break;
      if (state.stage === "opening") stampOpening(state, now);
      if (state.round && roundPick(state.round, jess)) finishRound(state, jess, now);
      state.round = null;
      state.status = "finished";
      state.finishedAt = now;
      state.paused = false;
      break;
    }
    case "pause":
      state.paused = !!action.paused;
      break;
    case "clue": {
      const text = String(action.text || "").trim().slice(0, 200);
      if (!text) break;
      state.clues.push({ id: uid(), roundId: state.round?.id || `beat-${state.openingIndex}`, text, at: now });
      state.clues = state.clues.slice(-MAX_LIST);
      break;
    }
    case "message": {
      const text = String(action.text || "").trim().slice(0, 200);
      if (text) state.message = { id: uid(), text, at: now };
      break;
    }
    case "handleRequest":
      state.handled[action.requestId] = action.result || "ignored";
      break;
    case "savePlan": {
      const p = action.plan;
      if (!p?.id || !categories[p.category]) throw new Error("A plan needs an id and a category");
      const i = state.plans.findIndex((x) => x.id === p.id);
      if (i === -1) state.plans.push(p);
      else state.plans[i] = p;
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

// ── Jess's actions (her own record, never Kyd's) ─────────

export function applyJessAction(prev, action, state, now = Date.now()) {
  const jess = { ...freshJess(), ...clone(prev) };
  if (action.type === "pick") {
    const round = state.round;
    if (!round || round.id !== action.roundId) throw new Error("That round is over");
    if (jess.picks[round.id]) return jess; // one pick per round, no take-backs 😭
    if (!round.cards.some((c) => c.id === action.cardId)) throw new Error("No such card");
    jess.picks[round.id] = { cardId: action.cardId, at: now };
  } else if (action.type === "request") {
    if (!moods[action.mood]) throw new Error("Unknown mood");
    jess.requests.push({ id: uid(), mood: action.mood, roundId: state.round?.id || null, at: now });
    jess.requests = jess.requests.slice(-MAX_LIST);
  } else if (action.type === "react") {
    jess.reactions.push({ id: uid(), roundId: action.roundId || null, text: String(action.text || "").slice(0, 80), at: now });
    jess.reactions = jess.reactions.slice(-MAX_LIST);
  } else {
    throw new Error(`Unknown action: ${action.type}`);
  }
  return jess;
}

// ── What each phone sees ─────────────────────────────────

function skyPhase(state) {
  if (state.status === "waiting") return 0;
  if (state.status === "finished") return 4;
  return Math.min(3, 1 + Math.floor(state.rounds.length * 0.75));
}

/** How a flipped card reads on Jess's phone, by revealMode. */
function jessReveal(state, round, plan) {
  if (round.swappedPlanId && !round.revealedFull) {
    return { mode: "swapped", text: "change of plans 😭", sub: "" };
  }
  const mode = round.revealedFull ? "full" : plan.revealMode || "hint";
  if (mode === "full") return { mode, text: plan.jessFull || plan.name, sub: "" };
  if (mode === "secret") return { mode, text: "you'll see 👀", sub: "" };
  return { mode: "hint", text: plan.jessHint || categories[round.category]?.label, sub: "" };
}

/** Exactly what Jess's phone may know. Never the plans under the cards. */
export function guestView(state, jess = freshJess()) {
  const started = state.status === "started";
  const round = started && state.stage === "round" ? state.round : null;
  const pick = roundPick(round, jess);
  const plan = pick ? state.plans.find((p) => p.id === activePlanId(round, pick)) : null;
  const beat = started && state.stage === "opening" ? state.opening[state.openingIndex] : null;
  const clueKey = round ? round.id : `beat-${state.openingIndex}`;

  return {
    status: state.status,
    stage: started ? state.stage : null,
    paused: state.paused,
    nightId: state.startedAt || 0,
    rev: state.rev,
    phase: skyPhase(state),
    her: settings.her,
    me: settings.me,
    beat: beat && { id: beat.id, eyebrow: beat.eyebrow, title: beat.title, body: beat.body, button: beat.button, animation: beat.animation },
    round: round && {
      id: round.id,
      n: round.n,
      label: categories[round.category]?.label || "",
      intro: round.intro,
      cards: round.cards.map((c) => ({ id: c.id, face: c.face })),
      picked: pick?.cardId || null,
      reveal: plan ? { line: round.revealLine, aside: round.aside, icon: plan.icon, ...jessReveal(state, round, plan) } : null,
      requested: jess.requests.some((r) => r.roundId === round.id),
    },
    clues: started ? state.clues.filter((c) => c.roundId === clueKey).map(({ id, text }) => ({ id, text })) : [],
    scrapbook: state.scrapbook,
    message: state.message,
    finale: state.status === "finished" ? settings.finale : null,
  };
}

/** Plans to suggest for one of Jess's "not feeling this?" requests. */
export function suggestionsFor(state, mood, now) {
  let cats = moods[mood]?.categories || [];
  if (!cats.length) cats = [state.nextCategory || chooseCategory(state, now, "surprise")].filter(Boolean);
  const current = state.round ? new Set(state.round.cards.map((c) => c.planId)) : new Set();
  return cats
    .flatMap((c) => availablePlans(state, c, now))
    .filter((p) => !current.has(p.id))
    .map((p) => p.id);
}

/** Everything the Control Room needs. */
export function hostView(state, jess = freshJess(), now = Date.now()) {
  const round = state.round;
  const pick = roundPick(round, jess);
  const history = state.rounds.map((r) => r.category);
  const projected = round ? [...history, round.category] : history;
  return {
    state,
    pick, // { cardId, at } or null
    activePlanId: activePlanId(round, pick),
    // What YES would deal next. Only a preview until WE FINISHED THIS.
    nextPreview: state.stage === "between" ? state.nextCategory : chooseCategory(state, now, seedFor(state, state.rounds.length + (round ? 1 : 0)), projected),
    categoryOptions: categoryOptions(state, now),
    categories,
    requests: jess.requests.map((r) => ({ ...r, label: moods[r.mood]?.label, emoji: moods[r.mood]?.emoji, handled: state.handled[r.id] || null, suggestions: suggestionsFor(state, r.mood, now) })),
    reactions: jess.reactions,
    serverTime: now,
  };
}
