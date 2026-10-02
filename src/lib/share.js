import { clonePlan } from "./storage.js";

/**
 * Host Mode edits live on the phone they were made on. To get them onto
 * Jess's phone without a backend, the QR link carries only what changed
 * from night.js, packed into the URL hash.
 */

const toBase64Url = (str) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (b64) => {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Only the fields that differ from the default plan. */
export function planDiff(plan) {
  const base = clonePlan();
  const diff = {};
  const chapters = {};
  plan.chapters.forEach((ch, ci) => {
    const baseCh = base.chapters[ci] || { choices: [] };
    const patch = {};
    for (const key of ["title", "subtitle", "label"]) {
      if (ch[key] !== baseCh[key]) patch[key] = ch[key];
    }
    const choices = {};
    ch.choices.forEach((c) => {
      const baseC = baseCh.choices.find((b) => b.id === c.id) || {};
      const cPatch = {};
      for (const key of Object.keys(c)) if (!same(c[key], baseC[key])) cPatch[key] = c[key];
      if (Object.keys(cPatch).length) choices[c.id] = cPatch;
    });
    if (Object.keys(choices).length) patch.choices = choices;
    if (Object.keys(patch).length) chapters[ci] = patch;
  });
  if (Object.keys(chapters).length) diff.c = chapters;

  const finale = {};
  for (const key of Object.keys(plan.finale)) {
    if (!same(plan.finale[key], base.finale[key])) finale[key] = plan.finale[key];
  }
  if (Object.keys(finale).length) diff.f = finale;
  if (plan.signature !== base.signature) diff.s = plan.signature;
  return diff;
}

export function applyDiff(diff) {
  const plan = clonePlan();
  Object.entries(diff.c || {}).forEach(([ci, patch]) => {
    const ch = plan.chapters[ci];
    if (!ch) return;
    const { choices = {}, ...rest } = patch;
    Object.assign(ch, rest);
    ch.choices = ch.choices.map((c) => (choices[c.id] ? { ...c, ...choices[c.id] } : c));
  });
  Object.assign(plan.finale, diff.f || {});
  if (diff.s !== undefined) plan.signature = diff.s;
  return plan;
}

/** The link inside Jess's QR code. */
export function jessLink(plan) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("jess", "");
  const diff = planDiff(plan);
  if (Object.keys(diff).length) url.hash = `p=${toBase64Url(JSON.stringify(diff))}`;
  return url.toString().replace("jess=", "jess");
}

/** If the page was opened from a QR link with edits, return that plan and clean the URL. */
export function readSharedPlan() {
  const match = window.location.hash.match(/^#p=([\w-]+)/);
  if (!match) return null;
  try {
    const plan = applyDiff(JSON.parse(fromBase64Url(match[1])));
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return plan;
  } catch {
    return null;
  }
}

/** True when launched from the iPhone Home Screen icon. */
export const isHomeScreenApp = () =>
  window.navigator.standalone === true ||
  window.matchMedia?.("(display-mode: standalone)").matches;
