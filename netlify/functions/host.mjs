import { handleHost } from "../lib/api.js";
import { blobStore } from "../lib/blobStore.js";

export default (req) => handleHost(req, blobStore(), process.env.HOST_PIN);

export const config = { path: "/api/host" };
