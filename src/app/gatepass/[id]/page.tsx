import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { GatepassPreview } from "@/components/gatepass/GatepassPreview";
import { ExitVerification } from "@/components/guard/ExitVerification";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Gatepass } from "@/types/gatepass";

interface GatepassDetailPageProps {
  params: {
    id: string;
  };
}

async function getGatepass(id: string): Promise<Gatepass | null> {
  const gatepass = await prisma.gatepass.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      updatedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!gatepass) {
    return null;
  }

  return gatepass;
}

export default async function GatepassDetailPage({
  params,
}: GatepassDetailPageProps) {
  const session = await getServerSession(authOptions);
  const gatepass = await getGatepass(params.id);

  if (!gatepass) {
    notFound();
  }

  const showExitVerification =
    session?.user.role === "GUARD" && gatepass.status === "COMPLETED";

  // Extract only the fields needed for ExitVerification
  const exitVerificationData = {
    id: gatepass.id,
    formNumber: gatepass.formNumber,
    truckLicenseNo: gatepass.truckLicenseNo,
    trailerLicenseNo: gatepass.trailerLicenseNo,
    trailerNo: gatepass.trailerNo,
    sealed: gatepass.sealed,
    sealNo1: gatepass.sealNo1,
    sealNo2: gatepass.sealNo2,
    status: gatepass.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gate Pass Details
        </h1>
        <p className="text-muted-foreground">
          View and manage gate pass information
        </p>
      </div>

      <GatepassPreview data={gatepass} />

      {showExitVerification && (
        <ExitVerification
          gatepass={exitVerificationData}
          onVerify={() => {
            // This will trigger a server refresh to show updated data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
