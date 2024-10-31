"use client";

import { signOut, useSession } from "next-auth/react";
import { Navigation } from "./Navigation";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">GatePass</span>
            </div>
            <div className="hidden md:block ml-10">
              <Navigation />
            </div>
          </div>

          <div className="flex items-center">
            {session?.user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500">Signed in as </span>
                  <span className="font-medium text-gray-900">
                    {session.user.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({session.user.role.toLowerCase()})
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
