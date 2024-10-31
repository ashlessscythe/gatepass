"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { GatepassTableData } from "@/types/gatepass";

interface GatepassTableProps {
  initialData: GatepassTableData;
}

export function GatepassTable({ initialData }: GatepassTableProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status !== "ALL" && { status }),
      });

      const response = await fetch(`/api/gatepass/list?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const newData = await response.json();
      setData(newData);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchData();
  };

  const handleStatusChange = (value: Status | "ALL") => {
    setStatus(value);
    setPage(1);
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
          />
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as Status | "ALL")
            }
            className="px-3 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="border rounded-md">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              {[
                "Form Number",
                "Date In",
                "Carrier",
                "Truck No.",
                "Operator",
                "Status",
                "Created by",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {data.gatepasses.map((gatepass) => (
              <tr
                key={gatepass.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/gatepass/${gatepass.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {gatepass.formNumber || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {new Date(gatepass.dateIn).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {gatepass.carrier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {gatepass.truckNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {gatepass.operatorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      gatepass.status === "COMPLETED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : gatepass.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : gatepass.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {gatepass.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {gatepass.createdBy?.name || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of{" "}
          {data.total} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1 border rounded-md bg-background text-foreground hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.pages || loading}
            className="px-3 py-1 border rounded-md bg-background text-foreground hover:bg-muted disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
