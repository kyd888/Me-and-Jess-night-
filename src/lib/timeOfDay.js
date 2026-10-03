import { useEffect, useState } from "react";

/**
 * The look follows the phone's own clock (her local timezone), not the date's
 * progress. Presentation only: nothing about the cards changes.
 *   morning 6–11 · day 11–17 · golden 17–20 · night 20–6
 * Preview any of them with ?tod=morning|day|golden|night
 */
export const TODS = ["morning", "day", "golden", "night"];

export function todFor(date = new Date()) {
  const forced = new URLSearchParams(window.location.search).get("tod");
  if (TODS.includes(forced)) return forced;
  const h = date.getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 20) return "golden";
  return "night";
}

const THEME_COLOR = { morning: "#cfe3f5", day: "#a9d3f2", golden: "#c85f8a", night: "#1c1838" };

/** Re-checks every 30s so the theme drifts into the next period with no refresh. */
export function useTimeOfDay() {
  const [tod, setTod] = useState(todFor);
  useEffect(() => {
    const id = setInterval(() => setTod(todFor()), 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.tod = tod;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[tod]);
  }, [tod]);
  return tod;
}

/** "tonight" at night, "today" in the daytime. */
export const dayWord = (tod) => (tod === "morning" || tod === "day" ? "today" : "tonight");
export const greeting = (tod) => (tod === "morning" ? "good morninggg" : "Hey Jess.");
