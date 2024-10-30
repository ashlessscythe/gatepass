export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold mb-4">Welcome to Gatepass</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Digital truck gate management system for efficient logistics operations
      </p>
      <div className="grid gap-4">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
