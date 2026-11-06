import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public self-registration. New accounts are created as PENDING and cannot
// sign in or access anything until an admin assigns a real role.
export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
    return new NextResponse("Too many attempts, try again later", {
      status: 429,
    });
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      name.length > 100 ||
      email.length > 254 ||
      !EMAIL_RE.test(email) ||
      password.length < 8 ||
      password.length > 128
    ) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.PENDING,
      },
    });

    return NextResponse.json({ status: "pending_approval" }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
