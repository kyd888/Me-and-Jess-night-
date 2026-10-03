import { sessionId } from "./api.js";

/**
 * Jess's link. The QR-code version carries ?arrive=1: scanning it is how the
 * app knows she's actually here. The texted/shared link doesn't, so opening
 * it early from home doesn't count as arriving.
 */
export function jessLink({ arrive = false } = {}) {
  const url = new URL(`${window.location.origin}/jess`);
  if (sessionId !== "tonight") url.searchParams.set("s", sessionId);
  if (arrive) url.searchParams.set("arrive", "1");
  return url.toString();
}
