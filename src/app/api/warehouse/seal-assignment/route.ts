import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "WAREHOUSE" && session.user.role !== "ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { gatepassId, sealNumber } = body;

    if (!gatepassId || !sealNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get current gatepass to check status and conditions
    const currentGatepass = await prisma.gatepass.findUnique({
      where: { id: gatepassId },
    });

    if (!currentGatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    // Determine the new status based on current conditions
    // Seals can be assigned during LOADING or AWAITING_DOCS
    let newStatus = currentGatepass.status;
    if (currentGatepass.status === GatepassStatus.LOADING) {
      // If still loading, move to AWAITING_DOCS when seal is assigned
      newStatus = GatepassStatus.AWAITING_DOCS;
    }
    // If already in AWAITING_DOCS, stay there (seal is just being added)
    // If documents are already transferred and sealed, should already be COMPLETED

    // Update gatepass with seal information
    const updatedGatepass = await prisma.gatepass.update({
      where: {
        id: gatepassId,
      },
      data: {
        sealed: true,
        sealNo1: sealNumber,
        status: newStatus,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to assign seal:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
