import { describe, expect, it } from "vitest";
import { GatepassStatus } from "@prisma/client";
import { isValidTransition, getStatusFromAction } from "@/lib/status-management";

describe("isValidTransition", () => {
  it("allows the happy-path workflow in order", () => {
    const path = [
      "PENDING",
      "BOL_VERIFIED",
      "AT_DOOR",
      "LOADING",
      "AWAITING_DOCS",
      "COMPLETED",
      "EXITED",
    ] as GatepassStatus[];
    for (let i = 0; i < path.length - 1; i++) {
      expect(isValidTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it("rejects skipping steps and going backwards", () => {
    expect(isValidTransition("PENDING", "LOADING")).toBe(false);
    expect(isValidTransition("COMPLETED", "PENDING")).toBe(false);
  });

  it("treats CANCELLED as terminal", () => {
    expect(isValidTransition("CANCELLED", "PENDING")).toBe(false);
  });

  it("allows cancelling from any non-terminal state", () => {
    expect(isValidTransition("AT_DOOR", "CANCELLED")).toBe(true);
  });
});

describe("getStatusFromAction", () => {
  it("only advances from the expected status", () => {
    expect(getStatusFromAction("VERIFY_BOL", "PENDING")).toBe("BOL_VERIFIED");
    expect(getStatusFromAction("VERIFY_BOL", "AT_DOOR")).toBeNull();
  });
});
