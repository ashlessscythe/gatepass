import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GatepassStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!["ADMIN", "GUARD"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    console.log("[GUARD_RECENT_GATEPASSES] Fetching recent gatepasses");

    const gatepasses = await prisma.gatepass.findMany({
      where: {
        // Only show active gatepasses
        NOT: {
          status: GatepassStatus.CANCELLED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // Show more gatepasses since we're showing all guards' entries
    });

    console.log(
      "[GUARD_RECENT_GATEPASSES] Found gatepasses:",
      gatepasses.length
    );

    return NextResponse.json({
      gatepasses: gatepasses.map((gatepass) => ({
        ...gatepass,
        dateIn: gatepass.dateIn.toISOString(),
        timeIn: gatepass.timeIn.toISOString(),
        dateOut: gatepass.dateOut?.toISOString(),
        timeOut: gatepass.timeOut?.toISOString(),
        createdAt: gatepass.createdAt.toISOString(),
        updatedAt: gatepass.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GUARD_RECENT_GATEPASSES]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
