import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { GatepassStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10") || 10)
    );
    const search = (searchParams.get("search") || "").slice(0, 100);
    const rawStatus = searchParams.get("status") || undefined;
    if (
      rawStatus &&
      rawStatus !== "ALL" &&
      !(Object.values(GatepassStatus) as string[]).includes(rawStatus)
    ) {
      return new NextResponse("Invalid status", { status: 400 });
    }
    const statusFilter = rawStatus;

    const skip = (page - 1) * limit;

    const where: Prisma.GatepassWhereInput = {
      ...(search
        ? {
            OR: [
              {
                carrier: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                truckNo: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                operatorName: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
      ...(statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter as GatepassStatus }
        : {}),
    };

    const [gatepasses, total] = await Promise.all([
      prisma.gatepass.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.gatepass.count({ where }),
    ]);

    return NextResponse.json({
      gatepasses: gatepasses.map(
        ({
          receiverSignature: _r,
          shipperSignature: _s,
          securitySignature: _sec,
          ...gatepass
        }) => ({
        ...gatepass,
        dateIn: gatepass.dateIn.toISOString(),
        timeIn: gatepass.timeIn.toISOString(),
        dateOut: gatepass.dateOut?.toISOString(),
        timeOut: gatepass.timeOut?.toISOString(),
        createdAt: gatepass.createdAt.toISOString(),
        updatedAt: gatepass.updatedAt.toISOString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GATEPASS_LIST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
