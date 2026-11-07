import { describe, expect, it } from "vitest";
import { signatureSchema } from "@/lib/schemas/gatepass";

describe("signatureSchema", () => {
  it("accepts a PNG data URL", () => {
    expect(signatureSchema.safeParse("data:image/png;base64,iVBORw0KGgo=").success).toBe(true);
  });
  it("rejects non-image and non-base64 values", () => {
    expect(signatureSchema.safeParse("hello").success).toBe(false);
    expect(signatureSchema.safeParse("data:text/html;base64,PHNjcmlwdD4=").success).toBe(false);
    expect(signatureSchema.safeParse("data:image/png;base64,<script>").success).toBe(false);
  });
  it("rejects oversized payloads", () => {
    const big = "data:image/png;base64," + "A".repeat(1_000_001);
    expect(signatureSchema.safeParse(big).success).toBe(false);
  });
});
