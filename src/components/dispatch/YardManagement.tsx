"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GatepassStatus } from "@prisma/client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Gatepass } from "@/types/gatepass";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function YardManagement() {
  const [gatepasses, setGatepasses] = useState<Gatepass[]>([]);
  const [pickupDoors, setPickupDoors] = useState<{ [id: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [id: string]: GatepassStatus }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Split gatepasses into pending and handled
  const { pendingGatepasses, handledGatepasses } = useMemo(() => {
    const pending = gatepasses.filter(
      (gatepass) =>
        // Only show BOL_VERIFIED in pending (driver checked in when BOL is verified)
        gatepass.status === GatepassStatus.BOL_VERIFIED &&
        // And only if they don't have a door assigned
        !gatepass.pickupDoor
    );

    const handled = gatepasses.filter(
      (gatepass) =>
        // Show all gatepasses that have a door assigned
        gatepass.pickupDoor ||
        // Or are in a status after door assignment
        gatepass.status === GatepassStatus.AT_DOOR ||
        gatepass.status === GatepassStatus.LOADING ||
        gatepass.status === GatepassStatus.AWAITING_DOCS ||
        gatepass.status === GatepassStatus.COMPLETED
    );

    return {
      pendingGatepasses: pending.sort((a, b) => (a.dateIn > b.dateIn ? -1 : 1)),
      handledGatepasses: handled.sort((a, b) => (a.dateIn > b.dateIn ? -1 : 1)),
    };
  }, [gatepasses]);

  const fetchGatepasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dispatch/verified-gatepasses");
      if (!response.ok) throw new Error("Failed to fetch gatepasses");
      const data = await response.json();
      setGatepasses(data);

      // Initialize pickup doors and statuses
      const initialDoors: { [id: string]: string } = {};
      const initialStatuses: { [id: string]: GatepassStatus } = {};
      data.forEach((gatepass: Gatepass) => {
        initialDoors[gatepass.id] = gatepass.pickupDoor || "";
        initialStatuses[gatepass.id] = gatepass.status;
      });
      setPickupDoors(initialDoors);
      setStatuses(initialStatuses);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gatepasses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGatepasses();
  }, [fetchGatepasses]);

  const updateStatus = useCallback(
    async (gatepassId: string, status: GatepassStatus) => {
      if (!gatepassId || !status) {
        toast({
          title: "Error",
          description: "Missing required fields for status update",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/dispatch/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatepassId,
            status,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to update status");
        }

        toast({
          title: "Success",
          description: "Status updated successfully",
        });

        // Update local state
        setStatuses((prev) => ({ ...prev, [gatepassId]: status }));

        // Refresh to get latest data
        await fetchGatepasses();
      } catch (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to update status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, fetchGatepasses]
  );

  const assignPickupDoor = useCallback(
    async (gatepassId: string) => {
      const door = pickupDoors[gatepassId];
      if (!door) {
        toast({
          title: "Error",
          description: "Please enter a door number",
          variant: "destructive",
        });
        return;
      }

      if (!gatepassId) {
        toast({
          title: "Error",
          description: "Missing gatepass ID",
          variant: "destructive",
        });
        return;
      }

      const gatepass = gatepasses.find((g) => g.id === gatepassId);
      if (!gatepass) {
        toast({
          title: "Error",
          description: "Gatepass not found",
          variant: "destructive",
        });
        return;
      }

      // Validate status requirements - must be BOL_VERIFIED (which means driver is checked in)
      if (gatepass.status !== GatepassStatus.BOL_VERIFIED) {
        toast({
          title: "Error",
          description:
            "BOL must be verified before assigning a door. Please verify BOL first.",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/dispatch/assign-door", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatepassId,
            door,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to assign door");
        }

        toast({
          title: "Success",
          description: "Pickup door assigned successfully",
        });

        // Refresh the list to get updated data
        await fetchGatepasses();
      } catch (error) {
        console.error("Error assigning door:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to assign pickup door. Please ensure the truck is checked in and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [pickupDoors, gatepasses, toast, fetchGatepasses]
  );

  const handleStatusChange = useCallback(
    async (id: string, value: GatepassStatus) => {
      await updateStatus(id, value);
    },
    [updateStatus]
  );

  const canAssignDoor = useCallback((status: GatepassStatus) => {
    return status === GatepassStatus.BOL_VERIFIED;
  }, []);

  const renderGatepassTable = (
    gatepasses: Gatepass[],
    showDoorAssignment: boolean = true
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Form #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Driver</TableHead>
          <TableHead>BOL #</TableHead>
          <TableHead>Pickup Door</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gatepasses.map((gatepass) => (
          <TableRow key={gatepass.id}>
            <TableCell>{gatepass.formNumber}</TableCell>
            <TableCell>{formatDate(gatepass.dateIn)}</TableCell>
            <TableCell>{gatepass.carrier}</TableCell>
            <TableCell>{gatepass.operatorName}</TableCell>
            <TableCell>{gatepass.bolNumber || "-"}</TableCell>
            <TableCell>
              {showDoorAssignment ? (
                <div className="flex gap-2">
                  <Input
                    value={pickupDoors[gatepass.id] || ""}
                    onChange={(e) =>
                      setPickupDoors((prev) => ({
                        ...prev,
                        [gatepass.id]: e.target.value,
                      }))
                    }
                    placeholder={
                      canAssignDoor(gatepass.status)
                        ? "Enter door"
                        : "Check in truck first"
                    }
                    disabled={loading || !canAssignDoor(gatepass.status)}
                  />
                  <Button
                    size="sm"
                    onClick={() => assignPickupDoor(gatepass.id)}
                    disabled={
                      loading ||
                      !pickupDoors[gatepass.id] ||
                      !canAssignDoor(gatepass.status)
                    }
                    title={
                      !canAssignDoor(gatepass.status)
                        ? "Truck must be checked in before assigning a door"
                        : ""
                    }
                  >
                    Assign
                  </Button>
                </div>
              ) : (
                gatepass.pickupDoor
              )}
            </TableCell>
            <TableCell>
              <Select
                value={statuses[gatepass.id]}
                onValueChange={(value) =>
                  handleStatusChange(gatepass.id, value as GatepassStatus)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GatepassStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.toLowerCase().replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {/* Check-in happens automatically when BOL is verified */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Yard Management</h2>
        <Button onClick={fetchGatepasses} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Door Assignment ({pendingGatepasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {renderGatepassTable(pendingGatepasses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handled Trucks ({handledGatepasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {renderGatepassTable(handledGatepasses, false)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
