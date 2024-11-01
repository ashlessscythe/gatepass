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
        OR: [
          { status: GatepassStatus.BOL_VERIFIED },
          { status: GatepassStatus.IN_YARD },
        ],
      },
      orderBy: {
        dateIn: "desc",
      },
    });

    return NextResponse.json(verifiedGatepasses);
  } catch (error) {
    console.error("Error fetching verified gatepasses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
