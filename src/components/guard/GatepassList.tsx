"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { Gatepass, GatepassStatus } from "@/types/gatepass";
import { useState } from "react";

interface GatepassListProps {
  initialData: Gatepass[];
}

export function GatepassList({ initialData }: GatepassListProps) {
  const router = useRouter();
  const [gatepasses, setGatepasses] = useState(initialData);

  const fetchGatepasses = async () => {
    try {
      const response = await fetch("/api/guard/gatepasses/recent");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGatepasses(data.gatepasses);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Gate Passes</h2>
        <button
          onClick={fetchGatepasses}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {gatepasses.map((gatepass) => (
          <div
            key={gatepass.id}
            className="p-4 border rounded-lg bg-card hover:bg-accent/50 cursor-pointer"
            onClick={() => router.push(`/gatepass/${gatepass.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    Form #{gatepass.formNumber || "N/A"}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      gatepass.status === GatepassStatus.COMPLETED
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : gatepass.status === GatepassStatus.PENDING
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : gatepass.status === GatepassStatus.CANCELLED
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {gatepass.status.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {gatepass.carrier} - {gatepass.operatorName}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(gatepass.dateIn)} {formatTime(gatepass.timeIn)}
              </div>
            </div>

            {gatepass.status === GatepassStatus.PENDING && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/gatepass/${gatepass.id}`);
                }}
                className="mt-4 w-full px-4 py-2 text-sm border font-medium text-foreground bg-background rounded-md hover:bg-primary/90 hover:text-secondary"
              >
                View Details
              </button>
            )}

            {gatepass.status === GatepassStatus.IN_YARD && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/gatepass/${gatepass.id}`);
                }}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              >
                Process Exit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
