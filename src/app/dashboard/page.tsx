export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of gate activity and pending tasks
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Active Gates</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Pending Verification</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Completed Today</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
