import { getStore } from "@netlify/blobs";

/** Netlify Blobs with strong consistency, so both phones always read the latest write. */
export function blobStore() {
  const store = getStore({ name: "date-night", consistency: "strong" });
  return {
    get: (key) => store.get(key, { type: "json" }),
    set: (key, value) => store.setJSON(key, value),
  };
}
