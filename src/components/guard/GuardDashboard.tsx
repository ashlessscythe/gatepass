"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gatepass } from "@/types/gatepass";
import { GatepassList } from "./GatepassList";

export function GuardDashboard() {
  const router = useRouter();
  const [recentGatepasses, setRecentGatepasses] = useState<Gatepass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentGatepasses = async () => {
      try {
        const response = await fetch("/api/guard/gatepasses/recent");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setRecentGatepasses(data.gatepasses);
      } catch (error) {
        console.error("Error fetching recent gatepasses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentGatepasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/gatepass/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
        >
          Create New Gate Pass
        </Link>
      </div>

      <GatepassList initialData={recentGatepasses} />
    </div>
  );
}
