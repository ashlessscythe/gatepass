"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GatepassData } from "@/types/gatepass";

export function GuardDashboard() {
  const router = useRouter();
  const [recentGatepasses, setRecentGatepasses] = useState<GatepassData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentGatepasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/guard/gatepasses/recent`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setRecentGatepasses(data.gatepasses);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentGatepasses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/gatepass"
          className="p-6 bg-card text-card-foreground rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-semibold mb-2">New Entry</h3>
          <p className="text-sm text-muted-foreground">
            Create a new gatepass for arriving truck
          </p>
        </Link>
        <div className="p-6 bg-card text-card-foreground rounded-lg border">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <p className="text-sm text-muted-foreground">
            1. Enter driver and truck details
            <br />
            2. Direct driver to dispatch for verification
            <br />
            3. Dispatch will handle further processing
          </p>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Entries</h3>
        <div className="bg-card p-4 rounded-lg border">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentGatepasses.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent entries</p>
                </div>
              ) : (
                recentGatepasses.map((gatepass) => (
                  <div
                    key={gatepass.id}
                    className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/gatepass/${gatepass.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-medium">
                            #{gatepass.formNumber}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created{" "}
                          {new Date(gatepass.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            Carrier:
                          </span>{" "}
                          {gatepass.carrier}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Truck No:
                          </span>{" "}
                          {gatepass.truckNo}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Operator:
                          </span>{" "}
                          {gatepass.operatorName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
