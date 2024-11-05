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
    const documents = await prisma.gatepass.findMany({
      where: {
        OR: [
          // Include gatepasses specifically awaiting documents
          { status: GatepassStatus.AWAITING_DOCS },
          // Also include those that are in earlier stages but might need documents
          {
            AND: [
              {
                status: {
                  in: [
                    GatepassStatus.BOL_VERIFIED,
                    GatepassStatus.IN_YARD,
                    GatepassStatus.AT_DOOR,
                    GatepassStatus.LOADING,
                  ],
                },
              },
              { documentsTransferred: false },
            ],
          },
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
