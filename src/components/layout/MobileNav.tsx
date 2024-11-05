"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Role } from "@prisma/client";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const links = [
    // Common links
    {
      href: "/dashboard",
      label: "Dashboard",
      show: true,
    },
    {
      href: "/gatepass",
      label: "Gatepasses",
      show: true,
    },

    // Main role pages
    {
      href: "/guard",
      label: "Guard Dashboard",
      show: session?.user.role === "GUARD" || session?.user.role === "ADMIN",
      section: "Main",
    },
    {
      href: "/dispatch",
      label: "Dispatch Dashboard",
      show: session?.user.role === "DISPATCH" || session?.user.role === "ADMIN",
      section: "Main",
    },
    {
      href: "/warehouse",
      label: "Warehouse Dashboard",
      show:
        session?.user.role === "WAREHOUSE" || session?.user.role === "ADMIN",
      section: "Main",
    },
    {
      href: "/admin",
      label: "Admin Dashboard",
      show: session?.user.role === "ADMIN",
      section: "Main",
    },
  ];

  // Group links by section
  const sections = links.reduce((acc, link) => {
    if (link.show) {
      const section = link.section || "General";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(link);
    }
    return acc;
  }, {} as Record<string, typeof links>);

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
            <nav className="space-y-6">
              {Object.entries(sections).map(([section, sectionLinks]) => (
                <div key={section} className="space-y-2">
                  {section !== "General" && (
                    <h3 className="text-sm font-semibold text-muted-foreground px-2">
                      {section}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {sectionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-2 py-1.5 text-foreground/60 hover:text-foreground hover:bg-muted rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-foreground">
                    {session?.user?.name}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {session?.user?.role?.toLowerCase()}
                  </div>
                </div>
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
