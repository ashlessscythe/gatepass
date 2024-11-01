"use client";

import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { GatepassData, GatepassStatus } from "@/types";
import { useState } from "react";

interface GatepassListProps {
  gatepasses: GatepassData[];
  onStatusUpdate: () => void;
}

export function GatepassList({
  gatepasses,
  onStatusUpdate,
}: GatepassListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "start" | "complete") => {
    setLoading(id);
    try {
      const response = await fetch(`/api/guard/gatepasses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onStatusUpdate();
    } catch (error) {
      console.error("Error updating gatepass:", error);
    } finally {
      setLoading(null);
    }
  };

  if (gatepasses.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No gatepasses found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gatepasses.map((gatepass) => (
        <div
          key={gatepass.id}
          className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/gatepass/${gatepass.id}`)}
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-medium">
                  #{gatepass.formNumber}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full
                  ${
                    gatepass.status === GatepassStatus.COMPLETED
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : gatepass.status === GatepassStatus.PENDING
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      : gatepass.status === "CANCELLED"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                >
                  {gatepass.status.toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(gatepass.dateIn)} at {formatTime(gatepass.timeIn)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Carrier:</span>{" "}
                  {gatepass.carrier}
                </p>
                <p>
                  <span className="text-muted-foreground">Truck No:</span>{" "}
                  {gatepass.truckNo}
                </p>
                <p>
                  <span className="text-muted-foreground">Operator:</span>{" "}
                  {gatepass.operatorName}
                </p>
              </div>
              <div className="w-full sm:w-auto">
                {gatepass.status === GatepassStatus.PENDING && (
                  <button
                    onClick={() => handleAction(gatepass.id, "start")}
                    disabled={loading === gatepass.id}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading === gatepass.id ? "Processing..." : "Start Entry"}
                  </button>
                )}
                {gatepass.status === GatepassStatus.IN_YARD && (
                  <button
                    onClick={() => handleAction(gatepass.id, "complete")}
                    disabled={loading === gatepass.id}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading === gatepass.id ? "Processing..." : "Complete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
