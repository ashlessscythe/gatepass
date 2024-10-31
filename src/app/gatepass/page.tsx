import { MainLayout } from "@/components/layout/MainLayout";
import { GatepassForm } from "@/components/forms/GatepassForm";

export default function GatepassPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Gate Pass
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to create a new gate pass
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <GatepassForm />
        </div>
      </div>
    </MainLayout>
  );
}
