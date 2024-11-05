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

    const { gatepassId, door } = await request.json();

    if (!gatepassId || !door) {
      return new NextResponse(
        "Missing required fields: gatepassId and door are required",
        { status: 400 }
      );
    }

    // Get current gatepass to check status
    const currentGatepass = await prisma.gatepass.findUnique({
      where: { id: gatepassId },
    });

    if (!currentGatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    // Validate status
    if (
      currentGatepass.status !== GatepassStatus.BOL_VERIFIED &&
      currentGatepass.status !== GatepassStatus.CHECKED_IN
    ) {
      return new NextResponse(
        "Invalid status: Truck must be checked in before assigning a door",
        { status: 400 }
      );
    }

    // Update gatepass with door assignment and status
    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        pickupDoor: door,
        status: GatepassStatus.AT_DOOR,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Error assigning door:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
