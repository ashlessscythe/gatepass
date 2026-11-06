import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateGatepassNumber } from "@/lib/utils";
import { gatepassFormSchema } from "@/lib/schemas/gatepass";
import { Purpose } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!["GUARD", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();

    try {
      const body = gatepassFormSchema.parse(json);

      // Convert date and time strings to DateTime
      const dateStr = `${body.dateIn}T${body.timeIn}:00Z`; // Add seconds and UTC marker
      const dateIn = new Date(dateStr);

      if (isNaN(dateIn.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
      }

      console.log("[GATEPASS_POST] Parsed date:", dateIn);

      // Generate a unique gatepass number
      let formNumber = generateGatepassNumber();
      let isUnique = false;

      // Ensure the generated number is unique
      while (!isUnique) {
        const existing = await prisma.gatepass.findFirst({
          where: { formNumber },
        });
        if (!existing) {
          isUnique = true;
        } else {
          formNumber = generateGatepassNumber();
        }
      }

      const gatepass = await prisma.gatepass.create({
        data: {
          formNumber,
          dateIn,
          timeIn: dateIn,
          carrier: body.carrier,
          truckLicenseNo: body.truckLicenseNo,
          truckNo: body.truckNo,
          trailerLicenseNo: body.trailerLicenseNo || null,
          trailerNo: body.trailerNo || null,
          operatorName: body.operatorName,
          passengerName: body.passengerName || null,
          purpose: body.purpose as Purpose,
          sealed: body.sealed,
          sealNo1: body.sealNo1 || null,
          sealNo2: body.sealNo2 || null,
          remarks: body.remarks || null,
          securityOfficer: body.securityOfficer,
          releaseRemarks: body.releaseRemarks || null,
          trailerType: body.trailerType || null,
          releaseTrailerNo: body.releaseTrailerNo || null,
          destination: body.destination || null,
          vehicleInspected: body.vehicleInspected,
          releaseSealNo: body.releaseSealNo || null,
          vestReturned: body.vestReturned,
          receiverSignature: body.receiverSignature,
          shipperSignature: body.shipperSignature,
          securitySignature: body.securitySignature,
          createdBy: {
            connect: {
              id: session.user.id,
            },
          },
          documentsTransferred: false,
          bolNumber: null,
          pickupDoor: null,
        },
      });

      console.log("[GATEPASS_POST] Created gatepass:", gatepass.id);
      return NextResponse.json(gatepass);
    } catch (error) {
      console.error("[GATEPASS_POST] Data processing error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Invalid data format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[GATEPASS_POST] Unexpected error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
