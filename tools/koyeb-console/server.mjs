#!/usr/bin/env node
// Local, zero-dependency Koyeb console. See README.md.
import http from "node:http";
import crypto from "node:crypto";
import readline from "node:readline";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API = "https://app.koyeb.com/v1";
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const ALLOW_WRITE = process.argv.includes("--allow-write");
const SESSION_CSRF = crypto.randomBytes(32).toString("hex");

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

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, {
    "content-type": type, "cache-control": "no-store",
    "content-security-policy": "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff", "referrer-policy": "no-referrer",
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  try {
    // DNS-rebinding defence: only accept our own host name.
    if (![`${HOST}:${PORT}`, `localhost:${PORT}`].includes(req.headers.host)) return send(res, 403, { error: "bad host" });
    const url = new URL(req.url, `http://${HOST}`);

    if (req.method === "GET" && url.pathname === "/") {
      const html = (await readFile(fileURLToPath(new URL("./index.html", import.meta.url)), "utf8"))
        .replace("__CSRF__", SESSION_CSRF).replace("__WRITE__", String(ALLOW_WRITE));
      return send(res, 200, html, "text/html; charset=utf-8");
    }
    if (!url.pathname.startsWith("/api/")) return send(res, 404, { error: "not found" });

    const path = url.pathname.slice(4);
    const isWrite = req.method === "POST";
    if (req.method !== "GET" && !isWrite) return send(res, 405, { error: "method" });
    if (req.headers["x-csrf"] !== SESSION_CSRF) return send(res, 403, { error: "csrf" });
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
  console.log(`Koyeb console: http://localhost:${PORT}  (${ALLOW_WRITE ? "WRITE ENABLED" : "read-only"})`));
