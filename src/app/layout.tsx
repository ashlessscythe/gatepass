import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: config.publicAppName,
  description: `${config.publicAppName} - Management System`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
