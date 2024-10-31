import { MainLayout } from "@/components/layout/MainLayout";

export default function GatepassPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gate Pass</h1>
          <p className="text-muted-foreground">
            Create and manage gate passes for trucks
          </p>
        </div>

        {/* Gate pass form will be added here in the next phase */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <p className="text-center text-muted-foreground">
            Gate pass form coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
