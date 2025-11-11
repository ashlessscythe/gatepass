import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import type { DocumentTransferData } from "@/types/gatepass";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "WAREHOUSE" && session.user.role !== "ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { gatepassId } = (await req.json()) as DocumentTransferData;

    if (!gatepassId) {
      return new NextResponse("Missing gatepass ID", { status: 400 });
    }

    // Get current gatepass to check status
    const currentGatepass = await prisma.gatepass.findUnique({
      where: { id: gatepassId },
    });

    if (!currentGatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    // Validate that we're in AWAITING_DOCS status
    if (currentGatepass.status !== GatepassStatus.AWAITING_DOCS) {
      return new NextResponse(
        "Invalid status: Documents can only be transferred when status is AWAITING_DOCS",
        { status: 400 }
      );
    }

    // Check if all requirements are met (seals assigned, shipper signature collected)
    const hasSeals = currentGatepass.sealed;
    const hasShipperSignature = Boolean(currentGatepass.shipperSignature);

    if (!hasSeals) {
      return new NextResponse(
        "Cannot complete: Seals must be assigned before transferring documents",
        { status: 400 }
      );
    }

    if (!hasShipperSignature) {
      return new NextResponse(
        "Cannot complete: Shipper signature is required before transferring documents",
        { status: 400 }
      );
    }

    // Update gatepass: mark documents as transferred and move to COMPLETED
    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        documentsTransferred: true,
        status: GatepassStatus.COMPLETED,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to transfer documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
