import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DispatchDashboard } from "@/components/dispatch/DispatchDashboard";

export default async function DispatchPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dispatch Dashboard</h1>
      <DispatchDashboard />
    </div>
  );
}
