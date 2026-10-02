import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { handleGuest, handleHost } from "./netlify/lib/api.js";

/**
 * Local stand-in for the Netlify Functions so `npm run dev` just works.
 * State lives in memory (restarting the dev server resets the night).
 */
function localApi() {
  const mem = new Map();
  const store = {
    get: async (k) => (mem.has(k) ? JSON.parse(mem.get(k)) : null),
    set: async (k, v) => void mem.set(k, JSON.stringify(v)),
  };
  const middleware = async (req, res, next) => {
    const route = req.url.startsWith("/api/state") ? "guest" : req.url.startsWith("/api/host") ? "host" : null;
    if (!route) return next();
    let body = "";
    for await (const chunk of req) body += chunk;
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
    });
    const response = route === "guest" ? await handleGuest(request, store) : await handleHost(request, store, process.env.HOST_PIN);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(await response.text());
  };
  return {
    name: "local-date-night-api",
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

export default defineConfig({
  plugins: [react(), localApi()],
});
