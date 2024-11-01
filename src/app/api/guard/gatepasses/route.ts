import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GatepassStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "GUARD") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as GatepassStatus | null;

    if (!status || !["PENDING", "IN_PROGRESS"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    console.log("[GUARD_GATEPASSES] Fetching gatepasses with status:", status);

    const gatepasses = await prisma.gatepass.findMany({
      where: {
        status,
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
      take: 10,
    });

    console.log("[GUARD_GATEPASSES] Found gatepasses:", gatepasses.length);

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
    console.error("[GUARD_GATEPASSES]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
