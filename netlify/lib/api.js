/**
 * HTTP handlers shared by the Netlify Functions and the local dev server.
 * `store` is anything with async get(key) → object|null and set(key, object).
 */
import { settings } from "../../data/plan.js";
import { applyHostAction, applyJessAction, freshJess, freshState, guestView, hostView, prefsOf } from "./engine.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const sessionOf = (url) => (url.searchParams.get("s") || "tonight").replace(/[^\w-]/g, "").slice(0, 40) || "tonight";
const stateKey = (sid) => `state-${sid}`;
const jessKey = (sid) => `jess-${sid}`;

async function load(store, sid) {
  const [state, jess] = await Promise.all([store.get(stateKey(sid)), store.get(jessKey(sid))]);
  // Anything saved by an older version of the app starts fresh.
  const usable = state && Array.isArray(state.plans) && Array.isArray(state.opening);
  return { state: usable ? state : freshState(sid), jess: { ...freshJess(), ...(jess || {}) } };
}

/** /api/state: Jess's phone. GET = what she sees; POST = her requests/reactions. */
export async function handleGuest(req, store) {
  const url = new URL(req.url);
  const sid = sessionOf(url);
  try {
    if (req.method === "GET") {
      const { state, jess } = await load(store, sid);
      return json(guestView(state, jess));
    }
    if (req.method === "POST") {
      const action = await req.json();
      const { state, jess } = await load(store, sid);
      const next = applyJessAction(jess, action, state);
      await store.set(jessKey(sid), next);
      // Scanning the QR code is the "she's here" moment: start the night
      // (unless Kyd turned that off and wants to tap JESS IS HERE himself).
      if (action.type === "arrive" && state.status === "waiting" && prefsOf(state).startOnScan) {
        const started = { ...applyHostAction(state, { type: "start" }, next), startedBy: "scan" };
        await store.set(stateKey(sid), started);
        return json(guestView(started, next));
      }
      return json(guestView(state, next));
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e.message }, 400);
  }
}

/** /api/host: Kyd's Control Room. Every call needs the PIN. */
export async function handleHost(req, store, envPin) {
  const url = new URL(req.url);
  const sid = sessionOf(url);
  const pin = String(envPin || settings.fallbackPin);
  if (req.headers.get("x-pin") !== pin) return json({ error: "Wrong PIN" }, 401);
  try {
    if (req.method === "GET") {
      const { state, jess } = await load(store, sid);
      return json(hostView(state, jess));
    }
    if (req.method === "POST") {
      const action = await req.json();
      const { state, jess } = await load(store, sid);
      const next = applyHostAction(state, action, jess);
      await store.set(stateKey(sid), next);
      if (action.type === "reset") {
        await store.set(jessKey(sid), freshJess());
        return json(hostView(next, freshJess()));
      }
      return json(hostView(next, jess));
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: e.message }, 400);
  }
}
