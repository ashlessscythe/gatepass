"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GatepassTableProps } from "@/types/gatepass";
import { GatepassStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";

export function GatepassTable({ initialData }: GatepassTableProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<GatepassStatus | "ALL">("ALL");
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

  const handleStatusChange = (value: GatepassStatus | "ALL") => {
    setStatus(value);
    setPage(1);
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData();
  };

  const getStatusColor = (status: GatepassStatus) => {
    switch (status) {
      case GatepassStatus.COMPLETED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case GatepassStatus.LOADING:
      case GatepassStatus.IN_YARD:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case GatepassStatus.CANCELLED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const formatStatus = (status: GatepassStatus) => {
    return status.toLowerCase().replace(/_/g, " ");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
          />
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as GatepassStatus | "ALL")
            }
            className="w-full sm:w-auto px-3 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="ALL">All Status</option>
            {Object.values(GatepassStatus).map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
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
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
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
                    {formatDate(gatepass.dateIn)}
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
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
                        gatepass.status
                      )}`}
                    >
                      {formatStatus(gatepass.status)}
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
      </div>

      {/* Pagination - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of{" "}
          {data.total} results
        </div>
        <div className="flex justify-center gap-2 order-1 sm:order-2">
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
