import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { signatureSchema } from "@/lib/schemas/gatepass";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["WAREHOUSE", "ADMIN"].includes(session.user.role)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { gatepassId, signature } = body;

    if (!gatepassId || typeof gatepassId !== "string" || !signature) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (!signatureSchema.safeParse(signature).success) {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // Update gatepass with driver's signature
    const updatedGatepass = await prisma.gatepass.update({
      where: {
        id: gatepassId,
      },
      data: {
        shipperSignature: signature, // Using shipper signature field for driver
        updatedById: session.user.id,
      },
    });

    return NextResponse.json(updatedGatepass);
  } catch (error) {
    console.error("Failed to update signature:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
