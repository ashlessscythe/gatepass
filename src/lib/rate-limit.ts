// Simple in-memory fixed-window rate limiter.
// NOTE: state is per server instance; use a shared store (e.g. Redis) if you
// run more than one instance.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  if (hits.size > 10_000) {
    hits.forEach((v, k) => {
      if (v.resetAt <= now) hits.delete(k);
    });
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function clientIp(headers: Headers | Record<string, any>): string {
  const get = (n: string) =>
    headers instanceof Headers ? headers.get(n) : headers[n];
  return (get("x-forwarded-for") || get("x-real-ip") || "unknown")
    .toString()
    .split(",")[0]
    .trim();
}
