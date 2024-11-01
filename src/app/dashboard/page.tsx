import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GatepassTable } from "@/components/gatepass/GatepassTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getGatepasses() {
  const gatepasses = await prisma.gatepass.findMany({
    take: 10,
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
  });

  const total = await prisma.gatepass.count();

  return {
    gatepasses: gatepasses.map((gatepass) => ({
      id: gatepass.id,
      formNumber: gatepass.formNumber,
      dateIn: gatepass.dateIn.toISOString(),
      carrier: gatepass.carrier,
      truckNo: gatepass.truckNo,
      operatorName: gatepass.operatorName,
      status: gatepass.status,
      createdBy: gatepass.createdBy,
      createdAt: gatepass.createdAt.toISOString(),
    })),
    total,
    pages: Math.ceil(total / 10),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const data = await getGatepasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          You are logged in as a {session.user.role.toLowerCase()}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Gate Passes</h2>
        <GatepassTable initialData={data} />
      </div>
    </div>
  );
}
