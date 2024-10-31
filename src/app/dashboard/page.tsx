import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
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
      ...gatepass,
      dateIn: gatepass.dateIn.toISOString(),
      timeIn: gatepass.timeIn.toISOString(),
      dateOut: gatepass.dateOut?.toISOString(),
      timeOut: gatepass.timeOut?.toISOString(),
      createdAt: gatepass.createdAt.toISOString(),
      updatedAt: gatepass.updatedAt.toISOString(),
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
    <MainLayout>
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
    </MainLayout>
  );
}
