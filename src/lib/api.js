import { useCallback, useEffect, useRef, useState } from "react";

/** Optional ?s=… lets you run a separate test night without touching the real one. */
export const sessionId = new URLSearchParams(window.location.search).get("s") || "tonight";
const qs = `?s=${encodeURIComponent(sessionId)}`;

async function call(path, { method = "GET", body, pin } = {}) {
  const res = await fetch(`${path}${qs}`, {
    method,
    headers: { "content-type": "application/json", ...(pin ? { "x-pin": pin } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const guestApi = {
  get: () => call("/api/state"),
  send: (action) => call("/api/state", { method: "POST", body: action }),
};

export const hostApi = {
  get: (pin) => call("/api/host", { pin }),
  send: (pin, action) => call("/api/host", { method: "POST", body: action, pin }),
};

/**
 * Polls every few seconds, plus immediately when the phone wakes up or
 * the tab comes back. Simple on purpose: reliability > cleverness tonight.
 */
export function usePoll(fetcher, ms = 2500, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const busy = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      setData(await fetcherRef.current());
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const id = setInterval(refresh, ms);
    const wake = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, ms, enabled]);

  return { data, setData, error, refresh };
}

/** Tiny localStorage helpers for per-phone niceties (never shared state). */
export const local = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode: fine */
    }
  },
};

export const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
