"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      show: true,
    },
    {
      href: "/guard",
      label: "Guard Dashboard",
      show: session?.user.role === "GUARD",
    },
    {
      href: "/gatepass",
      label: "New Gatepass",
      show: true,
    },
  ];

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
              {links
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-foreground/60 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
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
