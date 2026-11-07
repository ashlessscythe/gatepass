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
