import { beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";

const prisma = { user: { findUnique: vi.fn() } };
vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("../src/lib/prisma", () => ({ prisma }));

async function authorize(email: string, password: string) {
  const { authOptions } = await import("@/lib/auth");
  const provider: any = authOptions.providers[0];
  return provider.options.authorize(
    { email, password },
    { headers: { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250)}` } }
  );
}

beforeEach(() => vi.clearAllMocks());

describe("credentials authorize", () => {
  it("rejects PENDING users with PENDING_APPROVAL after a correct password", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "1", email: "p@x.com", name: "P", role: "PENDING",
      password: await hash("password123", 4),
    });
    await expect(authorize("p@x.com", "password123")).rejects.toThrow("PENDING_APPROVAL");
  });

  it("does not reveal pending status for a wrong password", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "1", email: "p@x.com", name: "P", role: "PENDING",
      password: await hash("password123", 4),
    });
    expect(await authorize("p@x.com", "wrongpassword")).toBeNull();
  });

  it("signs in approved users", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "2", email: "g@x.com", name: "G", role: "GUARD",
      password: await hash("password123", 4),
    });
    const user = await authorize("g@x.com", "password123");
    expect(user).toMatchObject({ id: "2", role: "GUARD" });
  });

  it("lowercases the email lookup", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await authorize("MiXed@X.com", "password123");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "mixed@x.com" } });
  });
});
