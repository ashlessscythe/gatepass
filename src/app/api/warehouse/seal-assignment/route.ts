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
    const { gatepassId, sealNumber } = body;

    if (!gatepassId || !sealNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update gatepass with seal information
    const updatedGatepass = await prisma.gatepass.update({
      where: {
        id: gatepassId,
      },
      data: {
        sealed: true,
        sealNo1: sealNumber,
        status: GatepassStatus.LOADING,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to assign seal:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
