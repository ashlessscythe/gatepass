import { describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `t1:${Math.random()}`;
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(false);
  });

  it("tracks keys independently", () => {
    expect(rateLimit(`a:${Math.random()}`, 1, 1000)).toBe(true);
    expect(rateLimit(`b:${Math.random()}`, 1, 1000)).toBe(true);
  });

  it("resets after the window", () => {
    vi.useFakeTimers();
    const key = `t2:${Math.random()}`;
    expect(rateLimit(key, 1, 1000)).toBe(true);
    expect(rateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000)).toBe(true);
    vi.useRealTimers();
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });
  it("falls back to unknown", () => {
    expect(clientIp(new Headers())).toBe("unknown");
    expect(clientIp({})).toBe("unknown");
  });
});
