import { handleGuest } from "../lib/api.js";
import { blobStore } from "../lib/blobStore.js";

export default (req) => handleGuest(req, blobStore());

export const config = { path: "/api/state" };
