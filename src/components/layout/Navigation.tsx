"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  const links = [
    // Common links
    {
      href: "/dashboard",
      label: "Dashboard",
      roles: ["ADMIN", "GUARD", "DISPATCH", "WAREHOUSE"],
    },
    {
      href: "/gatepass",
      label: "Gatepasses",
      roles: ["ADMIN", "GUARD", "DISPATCH", "WAREHOUSE"],
    },

    // Main role pages
    {
      href: "/guard",
      label: "Guard",
      roles: ["ADMIN", "GUARD"],
    },
    {
      href: "/dispatch",
      label: "Dispatch",
      roles: ["ADMIN", "DISPATCH"],
    },
    {
      href: "/warehouse",
      label: "Warehouse",
      roles: ["ADMIN", "WAREHOUSE"],
    },
    {
      href: "/admin",
      label: "Admin",
      roles: ["ADMIN"],
    },
  ];

  const userLinks = links.filter((link) =>
    link.roles.includes(session.user.role as string)
  );

  return (
    <nav className="flex items-center space-x-4">
      {userLinks.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
