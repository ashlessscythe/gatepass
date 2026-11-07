#!/usr/bin/env node
// Local, zero-dependency Koyeb console. See README.md.
import http from "node:http";
import crypto from "node:crypto";
import readline from "node:readline";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API = "https://app.koyeb.com/v1";
// REMOTE=1 -> hosted mode (e.g. on Koyeb) for phone access: password login + HTTPS required.
const REMOTE = process.env.REMOTE === "1";
const HOST = REMOTE ? "0.0.0.0" : "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const ALLOW_WRITE = process.argv.includes("--allow-write") || process.env.ALLOW_WRITE === "1";
const LOCAL_CSRF = crypto.randomBytes(32).toString("hex");
const PASSWORD = process.env.CONSOLE_PASSWORD || "";
if (REMOTE && PASSWORD.length < 16) { console.error("REMOTE=1 needs CONSOLE_PASSWORD (16+ chars)."); process.exit(1); }
const sha = (s) => crypto.createHash("sha256").update(s).digest();
const sessions = new Map(); // sid -> {csrf, exp}
let fails = [], lockedUntil = 0;
const cookieSid = (req) => /(?:^|; )__Host-sid=([\w-]+)/.exec(req.headers.cookie || "")?.[1];
const getSession = (req) => { const s = sessions.get(cookieSid(req)); return s && s.exp > Date.now() ? s : null; };
const readBody = (req) => new Promise((ok) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 2048) req.destroy(); }); req.on("end", () => ok(b)); });

async function promptHidden(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); };
  return new Promise((res) => rl.question(q, (a) => { rl.close(); process.stdout.write("\n"); res(a.trim()); }));
}
const TOKEN = process.env.KOYEB_API_TOKEN || (await promptHidden("Koyeb API token (hidden): "));
if (!TOKEN) { console.error("No token."); process.exit(1); }

// Allowlists: the browser can never reach arbitrary Koyeb endpoints.
const READ = [/^\/apps$/, /^\/apps\/[\w-]+$/, /^\/services$/, /^\/services\/[\w-]+$/,
  /^\/deployments$/, /^\/deployments\/[\w-]+$/, /^\/instances$/];
const WRITE = [/^\/services\/[\w-]+\/(redeploy|pause|resume)$/];

const send = (res, code, body, type = "application/json", extra = {}) => {
  res.writeHead(code, {
    ...extra,
    "content-type": type, "cache-control": "no-store",
    "content-security-policy": "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff", "referrer-policy": "no-referrer",
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  try {
    // DNS-rebinding defence: only accept our own host name.
    if (REMOTE) {
      if (req.headers["x-forwarded-proto"] !== "https") return send(res, 403, { error: "https only" });
      if (process.env.ALLOWED_HOST && req.headers.host !== process.env.ALLOWED_HOST) return send(res, 403, { error: "bad host" });
    } else if (![`${HOST}:${PORT}`, `localhost:${PORT}`].includes(req.headers.host)) return send(res, 403, { error: "bad host" });
    const url = new URL(req.url, `http://${HOST}`);
    const sess = REMOTE ? getSession(req) : { csrf: LOCAL_CSRF };

    if (REMOTE && req.method === "POST" && url.pathname === "/login") {
      if (req.headers["sec-fetch-site"] !== "same-origin") return send(res, 403, { error: "cross-site" });
      const now = Date.now();
      if (now < lockedUntil) return send(res, 429, { error: "locked, try later" });
      let pw = ""; try { pw = String(JSON.parse(await readBody(req)).password || ""); } catch {}
      if (!crypto.timingSafeEqual(sha(pw), sha(PASSWORD))) {
        fails = fails.filter((t) => now - t < 15 * 60e3); fails.push(now);
        if (fails.length >= 5) { lockedUntil = now + 15 * 60e3; fails = []; }
        await new Promise((r) => setTimeout(r, 1000));
        return send(res, 401, { error: "wrong password" });
      }
      const sid = crypto.randomBytes(32).toString("hex");
      sessions.set(sid, { csrf: crypto.randomBytes(32).toString("hex"), exp: now + 12 * 3600e3 });
      return send(res, 200, { ok: true }, "application/json", { "set-cookie": `__Host-sid=${sid}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200` });
    }
    if (REMOTE && req.method === "POST" && url.pathname === "/logout") {
      sessions.delete(cookieSid(req));
      return send(res, 200, { ok: true }, "application/json", { "set-cookie": "__Host-sid=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    }

    if (req.method === "GET" && url.pathname === "/") {
      const file = sess ? "index.html" : "login.html";
      const html = (await readFile(fileURLToPath(new URL("./" + file, import.meta.url)), "utf8"))
        .replace("__CSRF__", sess?.csrf || "").replace("__WRITE__", String(ALLOW_WRITE)).replace("__REMOTE__", String(REMOTE));
      return send(res, 200, html, "text/html; charset=utf-8");
    }
    if (!url.pathname.startsWith("/api/")) return send(res, 404, { error: "not found" });
    if (!sess) return send(res, 401, { error: "login required" });

    const path = url.pathname.slice(4);
    const isWrite = req.method === "POST";
    if (req.method !== "GET" && !isWrite) return send(res, 405, { error: "method" });
    if (req.headers["x-csrf"] !== sess.csrf) return send(res, 403, { error: "csrf" });
    if (req.headers["sec-fetch-site"] && req.headers["sec-fetch-site"] !== "same-origin") return send(res, 403, { error: "cross-site" });
    if (isWrite && !ALLOW_WRITE) return send(res, 403, { error: "read-only mode (start with --allow-write)" });
    if (!(isWrite ? WRITE : READ).some((r) => r.test(path))) return send(res, 403, { error: "endpoint not allowed" });

    const upstream = await fetch(API + path + url.search, {
      method: req.method,
      headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
      body: isWrite ? "{}" : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (isWrite) console.log(new Date().toISOString(), "WRITE", path, upstream.status);
    return send(res, upstream.status, await upstream.text());
  } catch (e) {
    return send(res, 502, { error: "upstream failure" }); // never echo internals/token
  }
});
server.listen(PORT, HOST, () =>
  console.log(`Koyeb console on :${PORT} ${REMOTE ? "[remote, login required]" : "[local]"} (${ALLOW_WRITE ? "WRITE ENABLED" : "read-only"})`));
