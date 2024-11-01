import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { gatepassId, bolNumber } = await request.json();

    if (!gatepassId || !bolNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const updatedGatepass = await prisma.gatepass.update({
      where: { id: gatepassId },
      data: {
        bolNumber,
        status: GatepassStatus.BOL_VERIFIED,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Error verifying BOL:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
