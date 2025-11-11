import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GatepassStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import type { PendingDocument } from "@/types/gatepass";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "WAREHOUSE" && session.user.role !== "ADMIN")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get gatepasses that need document handling
    // Documents are transferred when status is AWAITING_DOCS
    const documents = await prisma.gatepass.findMany({
      where: {
        AND: [
          { status: GatepassStatus.AWAITING_DOCS },
          { documentsTransferred: false },
        ],
      },
      select: {
        id: true,
        formNumber: true,
        carrier: true,
        operatorName: true,
        status: true,
        createdAt: true,
        sealed: true,
        documentsTransferred: true,
      },
      orderBy: {
        createdAt: "desc",
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
      sealed: doc.sealed,
      documentsTransferred: doc.documentsTransferred,
    }));

    return NextResponse.json(pendingDocuments);
  } catch (error) {
    console.error("Failed to fetch pending documents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
