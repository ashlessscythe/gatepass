"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground hover:bg-muted rounded-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b border-border">
          <div className="p-4 space-y-4">
            <nav className="space-y-4">
              <Link
                href="/dashboard"
                className="block text-foreground/60 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/gatepass"
                className="block text-foreground/60 hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                New Gatepass
              </Link>
            </nav>
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {session?.user?.name}
                </span>
                <ThemeToggle />
              </div>
              {session ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
