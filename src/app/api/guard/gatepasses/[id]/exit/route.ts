import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GUARD") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { securitySignature } = await req.json();

    if (!securitySignature) {
      return new NextResponse("Security signature is required", {
        status: 400,
      });
    }

    const gatepass = await prisma.gatepass.findUnique({
      where: { id: params.id },
    });

    if (!gatepass) {
      return new NextResponse("Gatepass not found", { status: 404 });
    }

    // Check if gatepass is in a valid state for exit
    if (gatepass.status !== "COMPLETED") {
      return new NextResponse(
        "Gatepass must be in COMPLETED status for exit verification",
        { status: 400 }
      );
    }

    // Update gatepass with exit details
    const updatedGatepass = await prisma.gatepass.update({
      where: { id: params.id },
      data: {
        timeOut: new Date(),
        dateOut: new Date(),
        securitySignature,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Error processing exit verification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
