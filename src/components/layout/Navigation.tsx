"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const isActive = (path: string) => pathname === path;

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      show: true,
    },
    {
      href: "/guard",
      label: "Guard Dashboard",
      show: session.user.role === "GUARD",
    },
    {
      href: "/gatepass",
      label: "New Gatepass",
      show: true,
    },
  ];

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {links
        .filter((link) => link.show)
        .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors hover:text-foreground/80 ${
              isActive(link.href) ? "text-foreground" : "text-foreground/60"
            }`}
          >
            {link.label}
          </Link>
        ))}
    </nav>
  );
}
