import { createServer } from "node:http";
import aiHandler from "./api/ai.js";

const PORT = Number(process.env.PORT) || 3001;
const MAX_BODY_BYTES = 1024 * 1024;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const rateBuckets = new Map();

const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

function send(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return true;
  }
  return !origin;
}

function checkRateLimit(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "")).split(",")[0].trim()
    || req.socket.remoteAddress
    || "unknown";
  const now = Date.now();
  const previous = rateBuckets.get(ip);
  if (!previous || now - previous.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  previous.count += 1;
  return previous.count <= RATE_LIMIT;
}

async function readJson(req) {
  let raw = "";
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    raw += chunk.toString("utf8");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 });
  }
}

const server = createServer(async (req, res) => {
  if (!applyCors(req, res)) {
    send(res, 403, { error: "This website is not allowed to use the MYP Desk AI service." });
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/health") {
    send(res, 200, { ok: true, service: "myp-desk-groq-api" });
    return;
  }

  if (url.pathname !== "/api/ai") {
    send(res, 404, { error: "Route not found." });
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    send(res, 405, { error: "Method not allowed." });
    return;
  }
  if (!checkRateLimit(req)) {
    send(res, 429, { error: "Too many requests. Please wait a minute and try again." });
    return;
  }

  try {
    const body = await readJson(req);
    const response = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) {
        res.writeHead(this.statusCode, {
          "Content-Type": "application/json; charset=utf-8",
          ...this.headers
        });
        res.end(JSON.stringify(payload));
        return this;
      }
    };
    await aiHandler({ method: "POST", body }, response);
  } catch (error) {
    send(res, error.status || 500, {
      error: error.message || "The AI service encountered an unexpected error."
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MYP Desk AI API listening on port ${PORT}`);
});
