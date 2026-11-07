import { beforeEach, describe, expect, it, vi } from "vitest";

const getServerSession = vi.fn();
const prisma = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  gatepass: { update: vi.fn() },
};

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma }));

const json = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const PNG = "data:image/png;base64,iVBORw0KGgo=";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/warehouse/update-signature", () => {
  it("rejects anonymous users", async () => {
    getServerSession.mockResolvedValue(null);
    const { POST } = await import("@/app/api/warehouse/update-signature/route");
    const res = await POST(json({ gatepassId: "g1", signature: PNG }));
    expect(res.status).toBe(401);
    expect(prisma.gatepass.update).not.toHaveBeenCalled();
  });

  it("rejects non-warehouse roles", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "GUARD" } });
    const { POST } = await import("@/app/api/warehouse/update-signature/route");
    const res = await POST(json({ gatepassId: "g1", signature: PNG }));
    expect(res.status).toBe(401);
    expect(prisma.gatepass.update).not.toHaveBeenCalled();
  });

  it("rejects invalid signatures", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "WAREHOUSE" } });
    const { POST } = await import("@/app/api/warehouse/update-signature/route");
    const res = await POST(json({ gatepassId: "g1", signature: "nope" }));
    expect(res.status).toBe(400);
  });

  it("allows warehouse users with a valid signature", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "WAREHOUSE" } });
    prisma.gatepass.update.mockResolvedValue({ id: "g1" });
    const { POST } = await import("@/app/api/warehouse/update-signature/route");
    const res = await POST(json({ gatepassId: "g1", signature: PNG }));
    expect(res.status).toBe(200);
    expect(prisma.gatepass.update).toHaveBeenCalledOnce();
  });
});

describe("POST /api/auth/register", () => {
  const ip = () => ({ "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` });

  it("creates a PENDING user with a lowercased email", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({});
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      json({ name: "A", email: "A@B.com", password: "password123" }, ip())
    );
    expect(res.status).toBe(201);
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.role).toBe("PENDING");
    expect(data.email).toBe("a@b.com");
    expect(data.password).not.toBe("password123");
  });

  it("ignores a client-supplied role", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({});
    const { POST } = await import("@/app/api/auth/register/route");
    await POST(
      json({ name: "A", email: "x@y.com", password: "password123", role: "ADMIN" }, ip())
    );
    expect(prisma.user.create.mock.calls[0][0].data.role).toBe("PENDING");
  });

  it("rejects short passwords and bad emails", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    expect((await POST(json({ name: "A", email: "x@y.com", password: "short" }, ip()))).status).toBe(400);
    expect((await POST(json({ name: "A", email: "nope", password: "password123" }, ip()))).status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rate-limits repeated attempts from one IP", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({});
    const { POST } = await import("@/app/api/auth/register/route");
    const headers = { "x-forwarded-for": "203.0.113.9" };
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) {
      codes.push(
        (await POST(json({ name: "A", email: `u${i}@y.com`, password: "password123" }, headers))).status
      );
    }
    expect(codes.slice(0, 5).every((c) => c === 201)).toBe(true);
    expect(codes[6]).toBe(429);
  });
});

describe("/api/admin/users", () => {
  it("rejects non-admins", async () => {
    getServerSession.mockResolvedValue({ user: { id: "u1", role: "DISPATCH" } });
    const { GET, POST } = await import("@/app/api/admin/users/route");
    expect((await GET()).status).toBe(401);
    expect((await POST(json({ name: "A", email: "a@b.com", password: "password123", role: "ADMIN" }))).status).toBe(401);
  });

  it("rejects invalid roles", async () => {
    getServerSession.mockResolvedValue({ user: { id: "admin", role: "ADMIN" } });
    const { POST } = await import("@/app/api/admin/users/route");
    const res = await POST(json({ name: "A", email: "a@b.com", password: "password123", role: "SUPERUSER" }));
    expect(res.status).toBe(400);
  });
});
