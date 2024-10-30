import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gatepass - Truck Management System",
  description:
    "Digital truck gate management system for efficient logistics operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
