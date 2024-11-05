import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const verifiedGatepasses = await prisma.gatepass.findMany({
      where: {
        // Only include active gatepasses
        NOT: {
          status: {
            in: [
              GatepassStatus.PENDING,
              GatepassStatus.CANCELLED,
              GatepassStatus.EXITED,
            ],
          },
        },
      },
      orderBy: [
        // Sort by date for consistent ordering
        { dateIn: "desc" },
      ],
      // Include all fields needed for display and logic
      select: {
        id: true,
        formNumber: true,
        dateIn: true,
        carrier: true,
        operatorName: true,
        bolNumber: true,
        pickupDoor: true,
        status: true,
        sealed: true,
        documentsTransferred: true,
      },
    });

    return NextResponse.json(verifiedGatepasses);
  } catch (error) {
    console.error("Error fetching verified gatepasses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
