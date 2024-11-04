import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { gatepassId } = body;

    if (!gatepassId) {
      return new NextResponse("Missing gatepass ID", { status: 400 });
    }

    // Update gatepass to mark documents as transferred
    const updatedGatepass = await prisma.gatepass.update({
      where: {
        id: gatepassId,
      },
      data: {
        documentsTransferred: true,
        status: GatepassStatus.LOADING,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to mark documents as transferred:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
