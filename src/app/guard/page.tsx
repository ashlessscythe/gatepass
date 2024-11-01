import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GuardDashboard } from "@/components/guard/GuardDashboard";
import { authOptions } from "@/lib/auth";

export default async function GuardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "GUARD"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Guard Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage truck entry and exit processes
        </p>
      </div>
      <GuardDashboard />
    </div>
  );
}
