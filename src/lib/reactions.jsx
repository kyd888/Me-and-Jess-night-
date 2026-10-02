import { useState } from "react";
import { contexts, reactions } from "../data/reactionLibrary.js";

/** Turn a library entry into an <img> src (GIPHY id/link, Tenor media URL, or local path). */
export function resolveUrl(r) {
  if (r.source === "giphy") {
    const id = r.url.match(/^[A-Za-z0-9]+$/) ? r.url : r.url.match(/(?:media\/|gifs\/(?:.*-)?)([A-Za-z0-9]+)(?:\/|$)/)?.[1];
    return id ? `https://media.giphy.com/media/${id}/giphy.gif` : r.url;
  }
  return r.url; // tenor media URLs and local paths are used as-is
}

const recent = [];

function weighted(list) {
  const total = list.reduce((s, r) => s + (r.weight ?? 1), 0);
  let n = Math.random() * total;
  for (const r of list) if ((n -= r.weight ?? 1) <= 0) return r;
  return list[list.length - 1];
}

/**
 * A random reaction for a moment in the night, or null when this
 * moment shouldn't get one (most of the time, for card picks).
 */
export function pickReaction(contextName, { force = false } = {}) {
  const ctx = contexts[contextName];
  if (!ctx || (!force && Math.random() >= ctx.chance)) return null;
  let pool = reactions.filter((r) => ctx.categories.includes(r.category) && (r.weight ?? 1) > 0);
  const fresh = pool.filter((r) => !recent.includes(r.id));
  if (fresh.length) pool = fresh; // don't repeat the same GIF in one night
  const r = pool.length ? weighted(pool) : null;
  if (r) recent.push(r.id);
  const caption = ctx.captions[Math.floor(Math.random() * ctx.captions.length)];
  return { id: r?.id || "none", src: r ? resolveUrl(r) : null, caption };
}

/** The GIF + caption. If the GIF can't load, just the caption shows. */
export function Reaction({ reaction, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!reaction) return null;
  return (
    <div className={`reaction ${className}`}>
      {reaction.src && !failed && <img src={reaction.src} alt="" onError={() => setFailed(true)} referrerPolicy="no-referrer" />}
      {reaction.caption && <p className="reaction-caption">{reaction.caption}</p>}
    </div>
  );
}
