import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";
import {
  isValidTransition,
  statusRequiresConditions,
} from "@/lib/status-management";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "DISPATCH" && session.user.role !== "ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { gatepassId, status } = await req.json();

    if (!gatepassId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get current gatepass
    const gatepass = await prisma.gatepass.findUnique({
      where: { id: gatepassId },
    });

    if (!gatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    // Validate status transition
    if (!isValidTransition(gatepass.status, status as GatepassStatus)) {
      return new NextResponse(
        `Invalid status transition from ${gatepass.status} to ${status}`,
        { status: 400 }
      );
    }

    // Check if status change requires specific conditions
    const conditions = {
      hasSeals: gatepass.sealed,
      hasDocuments: gatepass.documentsTransferred,
      hasSignatures: Boolean(
        gatepass.shipperSignature && gatepass.receiverSignature
      ),
    };

    if (
      !statusRequiresConditions(
        gatepass.status,
        status as GatepassStatus,
        conditions
      )
    ) {
      return new NextResponse(
        "Required conditions not met for this status change",
        { status: 400 }
      );
    }

    // Update gatepass status
    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        status: status as GatepassStatus,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Error updating gatepass status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
