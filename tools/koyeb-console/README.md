# Koyeb Console (local)

A tiny local dashboard for Koyeb. No dependencies, Node 18+.

```bash
export KOYEB_API_TOKEN=...        # or omit and you'll be prompted (hidden)
node tools/koyeb-console/server.mjs               # read-only
node tools/koyeb-console/server.mjs --allow-write # enables redeploy/pause/resume
```
Open http://localhost:8787.

## Security model
- Token stays in the server process; the browser never sees it.
- Binds to 127.0.0.1 only; Host header check blocks DNS rebinding.
- Per-session CSRF token + same-origin check; strict CSP; no external assets.
- Server-side allowlist: only listed GET endpoints, and only redeploy/pause/resume as writes.
- Read-only by default; writes need `--allow-write` plus typing the service name to confirm; writes are logged.
- Use a **scoped, short-lived** Koyeb token (Koyeb → Organization settings → API) and revoke it when done.
- Don't paste the token into chat/artifacts or commit it.

## Phone access (hosted mode)
A localhost server isn't reachable from a phone, so deploy it as its own small Koyeb service
(HTTPS is provided by Koyeb):

1. New Koyeb service from this repo, builder **Dockerfile**, path `tools/koyeb-console/Dockerfile`, port 8000 (HTTP).
2. Add **secrets** (not plain env vars): `KOYEB_API_TOKEN`, `CONSOLE_PASSWORD` (16+ random chars, e.g. from a password manager).
3. Optional: `ALLOWED_HOST=<your-service>.koyeb.app`; `ALLOW_WRITE=1` to enable redeploy/pause/resume (leave unset for read-only).
4. Open the URL on your phone, sign in, and "Add to Home Screen".

Hosted-mode protections: HTTPS-only, password login (constant-time compare, 5 failures -> 15 min lockout),
`__Host-` HttpOnly/Secure/SameSite=Strict session cookie (12h), per-session CSRF, same allowlist as local mode.
Use a scoped Koyeb token and rotate the password if you ever share the URL.
