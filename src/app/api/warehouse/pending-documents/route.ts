import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";
import type { PendingDocument } from "@/types/gatepass";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get gatepasses that need document handling
    const documents = await prisma.gatepass.findMany({
      where: {
        OR: [
          { status: GatepassStatus.BOL_VERIFIED },
          { status: GatepassStatus.IN_YARD },
        ],
        documentsTransferred: false,
      },
      select: {
        id: true,
        formNumber: true,
        carrier: true,
        operatorName: true,
        status: true,
        createdAt: true,
      },
    });

    // Convert dates to ISO strings to match PendingDocument type
    const pendingDocuments: PendingDocument[] = documents.map((doc) => ({
      id: doc.id,
      formNumber: doc.formNumber,
      carrier: doc.carrier,
      operatorName: doc.operatorName,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
    }));

    return NextResponse.json(pendingDocuments);
  } catch (error) {
    console.error("Failed to fetch pending documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
