import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "DISPATCH" && session.user.role !== "ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const gatepasses = await prisma.gatepass.findMany({
      where: {
        // Exclude completed and cancelled gatepasses
        NOT: {
          status: {
            in: [GatepassStatus.EXITED, GatepassStatus.CANCELLED],
          },
        },
      },
      select: {
        id: true,
        formNumber: true,
        carrier: true,
        operatorName: true,
        status: true,
        sealed: true,
        documentsTransferred: true,
        shipperSignature: true,
        receiverSignature: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(gatepasses);
  } catch (error) {
    console.error("Error fetching gatepasses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
