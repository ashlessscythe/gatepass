"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "./MobileNav";
import { Navigation } from "./Navigation";

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
        <div className="hidden md:flex items-center">
          <Navigation />
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">
                  {session.user?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session.user?.role?.toLowerCase()}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
