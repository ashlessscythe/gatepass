import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateGatepassNumber } from "@/lib/utils";
import { gatepassFormSchema } from "@/lib/schemas/gatepass";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = gatepassFormSchema.parse(json);

    // Convert date and time strings to DateTime
    const dateIn = new Date(body.dateIn + "T" + body.timeIn);

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
        trailerLicenseNo: body.trailerLicenseNo,
        trailerNo: body.trailerNo,
        operatorName: body.operatorName,
        passengerName: body.passengerName,
        purpose: body.purpose,
        sealed: body.sealed,
        sealNo1: body.sealNo1,
        sealNo2: body.sealNo2,
        remarks: body.remarks,
        securityOfficer: body.securityOfficer,
        releaseRemarks: body.releaseRemarks,
        trailerType: body.trailerType,
        releaseTrailerNo: body.releaseTrailerNo,
        destination: body.destination,
        vehicleInspected: body.vehicleInspected,
        releaseSealNo: body.releaseSealNo,
        vestReturned: body.vestReturned,
        createdBy: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(gatepass);
  } catch (error) {
    console.error("[GATEPASS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
