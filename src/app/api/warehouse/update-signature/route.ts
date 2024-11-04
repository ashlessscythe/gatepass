import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { gatepassId, signature } = body;

    if (!gatepassId || !signature) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update gatepass with driver's signature
    const updatedGatepass = await prisma.gatepass.update({
      where: {
        id: gatepassId,
      },
      data: {
        shipperSignature: signature, // Using shipper signature field for driver
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to update signature:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
