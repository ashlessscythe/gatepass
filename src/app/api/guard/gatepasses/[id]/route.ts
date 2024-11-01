import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GatepassStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "GUARD") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const { action } = json;

    console.log(
      "[GUARD_GATEPASS_UPDATE] Updating gatepass:",
      params.id,
      "Action:",
      action
    );

    const gatepass = await prisma.gatepass.findUnique({
      where: { id: params.id },
    });

    if (!gatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    console.log("[GUARD_GATEPASS_UPDATE] Current status:", gatepass.status);

    let newStatus: GatepassStatus;
    let updateData: any = {};

    switch (action) {
      case "start":
        if (gatepass.status !== "PENDING") {
          console.log(
            "[GUARD_GATEPASS_UPDATE] Invalid transition from",
            gatepass.status,
            "to IN_PROGRESS"
          );
          return new NextResponse("Invalid status transition", { status: 400 });
        }
        newStatus = GatepassStatus.PENDING;
        break;

      case "complete":
        if (gatepass.status !== GatepassStatus.PENDING) {
          console.log(
            "[GUARD_GATEPASS_UPDATE] Invalid transition from",
            gatepass.status,
            "to COMPLETED"
          );
          return new NextResponse("Invalid status transition", { status: 400 });
        }
        newStatus = GatepassStatus.COMPLETED;
        updateData.dateOut = new Date();
        updateData.timeOut = new Date();
        break;

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }

    console.log("[GUARD_GATEPASS_UPDATE] New status:", newStatus);

    const updatedGatepass = await prisma.gatepass.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        ...updateData,
        updatedBy: {
          connect: {
            id: session.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log("[GUARD_GATEPASS_UPDATE] Update successful");

    return NextResponse.json({
      ...updatedGatepass,
      dateIn: updatedGatepass.dateIn.toISOString(),
      timeIn: updatedGatepass.timeIn.toISOString(),
      dateOut: updatedGatepass.dateOut?.toISOString(),
      timeOut: updatedGatepass.timeOut?.toISOString(),
      createdAt: updatedGatepass.createdAt.toISOString(),
      updatedAt: updatedGatepass.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[GUARD_GATEPASS_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
