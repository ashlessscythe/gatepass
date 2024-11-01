import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pendingGatepasses = await prisma.gatepass.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        dateIn: "desc",
      },
    });

    return NextResponse.json(pendingGatepasses);
  } catch (error) {
    console.error("Error fetching pending gatepasses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
