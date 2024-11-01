import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { gatepassId, status } = await request.json();

    if (!gatepassId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate that status is a valid GatepassStatus
    if (!Object.values(GatepassStatus).includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        status: status,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Error updating status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
