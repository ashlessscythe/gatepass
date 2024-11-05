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

    // Update gatepass status and mark documents as transferred
    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        documentsTransferred: true,
        status: GatepassStatus.DOCS_TRANSFERRED,
        updatedById: session.user.id,
      },
    });

    // Check if both documents are transferred and seals are applied
    if (updatedGatepass.documentsTransferred && updatedGatepass.sealed) {
      // Update to COMPLETED status if all requirements are met
      await prisma.gatepass.update({
        where: { id: gatepassId },
        data: {
          status: GatepassStatus.COMPLETED,
          updatedById: session.user.id,
        },
      });
    }

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to transfer documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
