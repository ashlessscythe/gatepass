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
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as Status | "ALL")
            }
            className="px-3 py-2 border rounded-md"
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Truck No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created by
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.gatepasses.map((gatepass) => (
              <tr
                key={gatepass.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/gatepass/${gatepass.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gatepass.formNumber || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(gatepass.dateIn).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gatepass.carrier}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gatepass.truckNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gatepass.operatorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      gatepass.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : gatepass.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : gatepass.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gatepass.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {gatepass.createdBy?.name || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of{" "}
          {data.total} results
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === data.pages || loading}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
