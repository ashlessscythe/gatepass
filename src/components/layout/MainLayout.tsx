"use client";

import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="container py-6 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
