import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GatepassTable } from "@/components/gatepass/GatepassTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { GatepassTableData, GatepassTableItem } from "@/types/gatepass";

async function getGatepasses(): Promise<GatepassTableData> {
  const gatepasses = await prisma.gatepass.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      formNumber: true,
      dateIn: true,
      carrier: true,
      truckNo: true,
      operatorName: true,
      status: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
        },
      },
    },
  });

  const total = await prisma.gatepass.count();

  const mappedGatepasses: GatepassTableItem[] = gatepasses.map((gatepass) => ({
    id: gatepass.id,
    formNumber: gatepass.formNumber,
    dateIn: gatepass.dateIn.toISOString(),
    carrier: gatepass.carrier,
    truckNo: gatepass.truckNo,
    operatorName: gatepass.operatorName,
    status: gatepass.status,
    createdBy: gatepass.createdBy,
    createdAt: gatepass.createdAt.toISOString(),
  }));

  return {
    gatepasses: mappedGatepasses,
    total,
    pages: Math.ceil(total / 10),
  };
}

export default async function GatepassPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const data = await getGatepasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gate Passes</h1>
        <p className="text-muted-foreground">View and manage all gate passes</p>
      </div>

      <GatepassTable initialData={data} />
    </div>
  );
}
