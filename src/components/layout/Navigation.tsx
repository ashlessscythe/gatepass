"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["ADMIN", "GUARD", "DISPATCH", "WAREHOUSE"],
  },
  {
    href: "/gatepass",
    label: "Gate Pass",
    roles: ["ADMIN", "GUARD", "DISPATCH"],
  },
  {
    href: "/admin",
    label: "Admin",
    roles: ["ADMIN"],
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav className="flex space-x-4">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            } transition-colors`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
