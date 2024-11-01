import { notFound } from "next/navigation";
import { GatepassPreview } from "@/components/gatepass/GatepassPreview";
import { prisma } from "@/lib/prisma";
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
  const gatepass = await getGatepass(params.id);

  if (!gatepass) {
    notFound();
  }

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
    </div>
  );
}
