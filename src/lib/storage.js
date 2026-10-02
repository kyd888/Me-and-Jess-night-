import { night as defaultPlan } from "../data/night.js";

const PROGRESS_KEY = "jess-night:progress";
const PLAN_KEY = "jess-night:plan";

export const initialProgress = {
  screen: "intro", // intro | choose | reveal | finale
  chapter: 0, // index into plan.chapters
  picks: {}, // { [chapterIndex]: choiceId }
  finaleStep: 0, // 0 tease · 1 box · 2 gifts
  usedQuips: [],
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage full: the app still works, it just won't persist */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const clonePlan = () => JSON.parse(JSON.stringify(defaultPlan));

/** Host Mode edits win, unless night.js has a newer `version`. */
export function loadPlan() {
  const saved = read(PLAN_KEY);
  if (saved && saved.version === defaultPlan.version && saved.plan) return saved.plan;
  return clonePlan();
}

export const savePlan = (plan) => write(PLAN_KEY, { version: defaultPlan.version, plan });
export const clearPlan = () => remove(PLAN_KEY);

export function loadProgress() {
  const saved = read(PROGRESS_KEY);
  return saved ? { ...initialProgress, ...saved } : { ...initialProgress };
}

export const saveProgress = (progress) => write(PROGRESS_KEY, progress);
export const clearProgress = () => remove(PROGRESS_KEY);
