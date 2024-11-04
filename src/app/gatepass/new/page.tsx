import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GatepassForm } from "@/components/forms/GatepassForm";

export default async function NewGatepassPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "GUARD"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create New Gate Pass
        </h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new gate pass
        </p>
      </div>

      <GatepassForm />
    </div>
  );
}
