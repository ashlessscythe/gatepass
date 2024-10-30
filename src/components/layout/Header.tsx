import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        <div className="mr-6 flex">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <span className="text-lg font-bold">Gatepass</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/gatepass"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            New Gatepass
          </Link>
        </nav>
      </div>
    </header>
  );
}
