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

// ── Kyd's private settings ───────────────────────────────

/**
 * Date length. Changing it mid-date only changes what gets dealt NEXT.
 *   min/max     rounds (cards she flips)
 *   minutes     after this long (and at least `min` rounds) the date is "complete"
 *   maxDuration longest single plan that can be dealt
 *   cluster     how hard to keep stops in the same district
 */
export const LENGTHS = {
  QUICK: { label: "Quick", hint: "45–75 min", min: 1, max: 2, minutes: 60, maxDuration: 50, cluster: 3 },
  SHORT: { label: "Short", hint: "1.5–2 hrs", min: 2, max: 3, minutes: 105, maxDuration: 75, cluster: 1.5 },
  FULL: { label: "Full", hint: "3–5 hrs", min: 4, max: 6, minutes: 240, maxDuration: Infinity, cluster: 0.7 },
  OPEN: { label: "Open", hint: "no target", min: Infinity, max: Infinity, minutes: Infinity, maxDuration: Infinity, cluster: 0.7 },
};

export const DEFAULT_PREFS = {
  length: "FULL",
  city: "TULSA", // TULSA | OKC | CUSTOM (custom = only plans that work anywhere)
  customCity: "",
  area: "", // optional starting district, e.g. "Plaza"
  energy: "NORMAL", // CHILL | NORMAL | ACTIVE
  vibe: null, // HUNGRY | SWEET | COFFEE | GAME | TALK | RANDOM | HOME
  opening: true, // the "come inside / flowers" beats before the first card
  startOnScan: true, // scanning the QR code = she's here = the night starts
};

const VIBES = {
  HUNGRY: ["FOOD"],
  SWEET: ["SWEET"],
  COFFEE: ["COFFEE"],
  GAME: ["GAME"],
  TALK: ["TALK"],
  RANDOM: ["OUTING", "CHALLENGE"],
  HOME: ["HOME", "COZY"],
};

export const prefsOf = (state) => ({ ...DEFAULT_PREFS, ...(state.prefs || {}) });
const lengthOf = (state) => LENGTHS[prefsOf(state).length] || LENGTHS.FULL;

/** Enough rounds / time for this length? (A quick date that's done is a complete date.) */
export function dateComplete(state, now, done = state.rounds.length) {
  const L = lengthOf(state);
  if (done >= L.max) return true;
  return done >= L.min && state.startedAt && (now - state.startedAt) / 60000 >= L.minutes;
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
    prefs: { ...DEFAULT_PREFS },
    chilling: false, // KEEP CHILLING: nothing new gets dealt until you say so
    finaleTitle: null,
    scrapbook: [],
    clues: [],
    message: null,
    handled: {},
    rev: 0,
    updatedAt: Date.now(),
  };
}

export const freshJess = () => ({ requests: [], reactions: [], picks: {}, arrivedAt: null });

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
const mealsDone = (state) =>
  state.rounds.filter((r) => {
    const p = state.plans.find((x) => x.id === r.planId);
    return p?.meal || (p?.wildcard && r.category === "FOOD"); // "your call" in a food round = dinner
  }).length;

const planOf = (state, id) => state.plans.find((p) => p.id === id);

export function availablePlans(state, category, now, { includeUsed = false } = {}) {
  const used = new Set(finishedPlans(state));
  // Don't send you back to the same venue twice (home is fine, obviously).
  const visited = new Set(
    finishedPlans(state)
      .map((id) => planOf(state, id))
      .filter((p) => p && p.where === "out" && p.place)
      .map((p) => p.place)
  );
  const hungry = mealsDone(state) === 0;
  const prefs = prefsOf(state);
  const L = lengthOf(state);
  return state.plans.filter(
    (p) =>
      p.category === category &&
      !p.wildcard &&
      // City: plans for this city, plus anything that works anywhere.
      ((p.city || "ANY") === "ANY" || p.city === prefs.city) &&
      // Out of town: home is a drive away, so no "at home" plans.
      !(prefs.city !== settings.homeCity && p.where === "home") &&
      // Length: nothing that would eat the whole date.
      (p.duration || 0) <= L.maxDuration &&
      !(prefs.length === "QUICK" && p.reservation) &&
      !(prefs.energy === "CHILL" && p.walking) &&
      p.enabled !== false &&
      (includeUsed || (!used.has(p.id) && !(p.where === "out" && visited.has(p.place)))) &&
      isOpen(p, now) &&
      // One real meal per night (force a category in the Control Room to override).
      !(p.meal && !hungry && !includeUsed) &&
      // Long things (full movies) wait until after she's eaten.
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
  const late = t >= 22 * 60;
  const lastRound = state.rounds[state.rounds.length - 1];
  const atHome = lastRound && planOf(state, lastRound.planId)?.where === "home";
  const prefs = prefsOf(state);
  const quickish = prefs.length === "QUICK" || prefs.length === "SHORT";
  const complete = dateComplete(state, now, done);
  const here = currentDistrict(state);

  return Object.keys(categories).map((id) => {
    const cat = categories[id];
    let reason = null;
    let weight = cat.weight ?? 1;

    if (id === last) reason = "just did this";
    else if (cat.group === lastGroup) weight *= 0.3;
    if (count(id) >= 1) weight *= 0.4;

    // One real meal; the later it gets without one, the more FOOD wants to happen.
    if (id === "FOOD" && meals >= 1) reason = reason || "already had a meal";
    if (id === "FOOD" && meals === 0) weight *= t >= 19 * 60 + 30 ? 25 : t >= 19 * 60 ? 8 : done >= 1 ? 4 : 1.5;

    // Dessert after food (or once the night's well underway), once.
    if (id === "SWEET" && count("SWEET") >= 1) reason = reason || "already had dessert";
    if (id === "SWEET" && meals === 0 && done < 3) reason = reason || "dessert comes after food";
    if (id === "SWEET" && meals >= 1) weight *= 1.8;

    // Talking is optional: never first, never twice in a row, at most twice.
    if (id === "TALK" && done === 0) reason = reason || "not as the first thing";
    if ((id === "TALK" || id === "CHALLENGE") && count(id) >= 2) reason = reason || "already did two";

    // Staying home is a real option, not a consolation prize.
    if (id === "HOME") weight *= late ? 2 : done >= 2 ? 1.2 : 0.8;

    // The cozy ending is for later in the night.
    if (id === "COZY" && done < 3 && t < 21 * 60 + 30) reason = reason || "that's an ending, too early";
    if (id === "COZY") weight *= late ? 3 : 1.5;
    if (history.includes("COZY") && id !== "SWEET") reason = reason || "that was the cozy ending";

    // Already settled in at home? Going back out is less likely.
    if (atHome && id === "OUTING") weight *= 0.5;

    if (late) {
      if (["HOME", "COZY", "SWEET", "GAME"].includes(id)) weight *= 1.8;
      if (["OUTING", "CHALLENGE"].includes(id)) weight *= 0.4;
    }

    // She likes dark coffee and games: a little extra weight. Coffee is a daytime thing.
    if (id === "COFFEE") weight *= t >= 21 * 60 ? 0.4 : t < 17 * 60 ? 1.6 : 1.2;
    if (id === "GAME") weight *= 1.2;

    // Short dates: food + dessert/coffee + something tiny. Dessert doesn't have to wait.
    if (quickish) {
      if (reason === "dessert comes after food" || reason === "that's an ending, too early") reason = null;
      if (id === "FOOD" && meals === 0) weight *= 1.5;
      if (["SWEET", "COFFEE"].includes(id)) weight *= 1.8;
      if (["OUTING", "CHALLENGE", "TALK"].includes(id)) weight *= 0.6;
    }

    // Energy
    if (prefs.energy === "CHILL") weight *= { OUTING: 0.4, CHALLENGE: 0.5, GAME: 0.8, HOME: 1.5, COZY: 1.3, COFFEE: 1.3, TALK: 1.3, SWEET: 1.2 }[id] || 1;
    if (prefs.energy === "ACTIVE") weight *= { OUTING: 1.8, CHALLENGE: 1.5, GAME: 1.4, HOME: 0.6, COZY: 0.6 }[id] || 1;

    // Current vibe: heavily favor it.
    if (prefs.vibe && VIBES[prefs.vibe]?.includes(id)) weight *= 5;

    // Out of town: home is far away.
    if (prefs.city !== settings.homeCity && ["HOME", "COZY"].includes(id)) weight *= 0.3;

    // Quick/short: favor categories with a stop right where you are.
    if (quickish && here && availablePlans(state, id, now).some((p) => p.district === here)) weight *= 1.8;

    // Date length reached: the engine stops suggesting (you can still force one).
    if (complete) reason = reason || "date's complete (you can still force one)";

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
/** Where the last stop was (or where you said you are). */
function currentDistrict(state) {
  for (let i = state.rounds.length - 1; i >= 0; i--) {
    const p = planOf(state, state.rounds[i].planId);
    if (p?.where === "out") return p.district || null;
  }
  return prefsOf(state).area || null;
}

/** Shuffle, but prefer stops near the last one (hard in QUICK) and plans that fit the energy. */
function rankPlans(state, plans) {
  const prefs = prefsOf(state);
  const L = lengthOf(state);
  const here = currentDistrict(state);
  const score = (p) => {
    let s = Math.random();
    if (here && p.district === here) s += L.cluster;
    else if (here && p.district && p.district !== here) s -= L.cluster * 0.8;
    if (prefs.length === "QUICK" && (p.duration || 0) <= 20) s += 0.3;
    if (prefs.energy === "CHILL" && p.where !== "out") s += 0.3;
    if (prefs.energy === "ACTIVE" && p.where === "out" && (p.duration || 0) >= 30) s += 0.3;
    if (prefs.city !== settings.homeCity && p.where === "home") s -= 1;
    return s;
  };
  return plans.map((p) => [score(p), p]).sort((a, b) => b[0] - a[0]).map(([, p]) => p);
}

function dealRound(state, category, now) {
  const pool = rankPlans(state, availablePlans(state, category, now));
  if (!pool.length) throw new Error(`No open plans left in ${category}`);
  const roll = Math.random();
  const want = roll < 0.15 ? 2 : roll > 0.85 ? 4 : 3;
  const chosen = pool.slice(0, Math.min(want, pool.length));
  // Sometimes one card is secretly "your call": you decide based on her vibe.
  const wildcard = state.plans.find((p) => p.wildcard && p.enabled !== false);
  const lastWasWildcard = planOf(state, state.rounds[state.rounds.length - 1]?.planId)?.wildcard;
  if (wildcard && !lastWasWildcard && chosen.length >= 2 && Math.random() < (settings.yourCallChance ?? 0.15)) {
    chosen[Math.floor(Math.random() * chosen.length)] = wildcard;
  }
  const faces = shuffle(copy.faces);
  return {
    id: uid(),
    n: state.rounds.length + 1,
    category,
    intro: pickOne(copy.roundIntros),
    cards: chosen.map((p, i) => ({
      id: uid(),
      face: faces[i % faces.length],
      planId: p.id,
      // Plans with several possible reveals (e.g. a random movie genre) get one now.
      variant: p.jessFullOptions?.length ? pickOne(p.jessFullOptions) : null,
    })),
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
      // Out: the venue. Home / anywhere: the short line she saw.
      title: plan?.where === "out" ? plan.place || plan.name : round.cards.find((c) => c.planId === plan?.id)?.variant || plan?.jessFull || plan?.name || "",
      caption: plan?.caption || pickOne(copy.captions),
      icon: plan?.icon || "✦",
      at: pick.at,
    });
  }
  state.round = null;
  state.stage = "between";
  state.chilling = false;
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
      const withOpening = state.opening.length && prefsOf(state).opening;
      state.stage = withOpening ? "opening" : "between";
      state.openingIndex = 0;
      if (!withOpening) state.nextCategory = chooseCategory(state, now, seedFor(state, 0));
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
      const category = action.category || (dateComplete(state, now) ? null : state.nextCategory || chooseCategory(state, now, uid()));
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
      // Short dates get a playful little ending, not the big one. Still a complete date.
      state.finaleTitle = ["QUICK", "SHORT"].includes(prefsOf(state).length) ? pickOne(settings.shortEndings) : null;
      break;
    }
    case "setPrefs": {
      const next = { ...prefsOf(state), ...(action.prefs || {}) };
      if (!LENGTHS[next.length]) throw new Error("Unknown date length");
      state.prefs = next;
      // Re-plan what's next. Nothing already happening changes.
      if (state.stage === "between") state.nextCategory = chooseCategory(state, now, seedFor(state, `${state.rounds.length}-${JSON.stringify(next)}`));
      break;
    }
    case "chill":
      state.chilling = !!action.on;
      break;
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
      // Keeps your settings (length, city…), wipes everything else.
      return { ...freshState(state.sessionId), prefs: prefsOf(state), rev: state.rev + 1, updatedAt: now };
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
  } else if (action.type === "arrive") {
    // She scanned the QR code. Only the first scan counts.
    if (!jess.arrivedAt) jess.arrivedAt = now;
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
function jessReveal(state, round, plan, pickedPlan) {
  if (round.swappedPlanId && !round.revealedFull) {
    // She picked "your call" and you chose: it stays a surprise.
    if (pickedPlan?.wildcard) return { mode: "secret", text: "you'll see 👀", sub: "" };
    return { mode: "swapped", text: "change of plans 😭", sub: "" };
  }
  const mode = round.revealedFull ? "full" : plan.revealMode || "hint";
  const variant = !round.swappedPlanId && round.cards.find((c) => c.planId === plan.id)?.variant;
  if (mode === "full") return { mode, text: variant || plan.jessFull || plan.name, sub: "" };
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
    arrivedAt: jess.arrivedAt || null,
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
      reveal: plan ? { line: round.revealLine, aside: round.aside, icon: plan.icon, ...jessReveal(state, round, plan, planOf(state, round.cards.find((c) => c.id === pick.cardId)?.planId)) } : null,
      requested: jess.requests.some((r) => r.roundId === round.id),
    },
    clues: started ? state.clues.filter((c) => c.roundId === clueKey).map(({ id, text }) => ({ id, text })) : [],
    scrapbook: state.scrapbook,
    message: state.message,
    finale: state.status === "finished" ? { ...settings.finale, title: state.finaleTitle || settings.finale.title } : null,
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

/** Districts known for a city (for the "current area" picker). */
function areasFor(city) {
  return [...new Set(defaultPlans.filter((p) => p.city === city && p.district).map((p) => p.district))];
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
    // For a "your call" card: real options from this round's category.
    yourCallOptions: round ? availablePlans(state, round.category, now).filter((p) => !round.cards.some((c) => c.planId === p.id)).map((p) => p.id) : [],
    // What YES would deal next. Only a preview until WE FINISHED THIS.
    nextPreview: state.stage === "between" ? (dateComplete(state, now) ? null : state.nextCategory) : chooseCategory(state, now, seedFor(state, state.rounds.length + (round ? 1 : 0)), projected),
    categoryOptions: categoryOptions(state, now),
    prefs: prefsOf(state),
    lengths: Object.fromEntries(Object.entries(LENGTHS).map(([k, v]) => [k, { label: v.label, hint: v.hint, min: v.min, max: v.max }])),
    dateComplete: dateComplete(state, now),
    areas: areasFor(prefsOf(state).city),
    categories,
    requests: jess.requests.map((r) => ({ ...r, label: moods[r.mood]?.label, emoji: moods[r.mood]?.emoji, handled: state.handled[r.id] || null, suggestions: suggestionsFor(state, r.mood, now) })),
    reactions: jess.reactions,
    arrivedAt: jess.arrivedAt || null,
    serverTime: now,
  };
}
