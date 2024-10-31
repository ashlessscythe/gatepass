import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {session.user.role === "GUARD" && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold">Create Gate Pass</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Create a new gate pass for incoming trucks
              </p>
            </div>
          )}

          {session.user.role === "DISPATCH" && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold">Verify Documents</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Review and verify gate pass documentation
              </p>
            </div>
          )}

          {session.user.role === "WAREHOUSE" && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="font-semibold">Warehouse Operations</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Manage warehouse documentation and processes
              </p>
            </div>
          )}

          {session.user.role === "ADMIN" && (
            <>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Manage user accounts and permissions
                </p>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold">System Overview</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  View system statistics and activity logs
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
