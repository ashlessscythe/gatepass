"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold">Gatepass System</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
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

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-foreground/60 hover:text-foreground/80"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-foreground/60 hover:text-foreground/80"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
