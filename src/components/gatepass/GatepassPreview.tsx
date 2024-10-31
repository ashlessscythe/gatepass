"use client";

import { GatepassPreviewProps } from "@/types/gatepass";

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "-"}
      </p>
    </div>
  );
}

export function GatepassPreview({ data }: GatepassPreviewProps) {
  return (
    <div className="space-y-8 bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">
            Gate Pass{" "}
            <span className="text-blue-600">
              #{data.formNumber || "PREVIEW"}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            Created by {data.createdBy?.name || "Unknown"} on{" "}
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full
          ${
            data.status === "COMPLETED"
              ? "bg-green-100 text-green-800"
              : data.status === "IN_PROGRESS"
              ? "bg-yellow-100 text-yellow-800"
              : data.status === "CANCELLED"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {data.status.toLowerCase()}
        </span>
      </div>

      <PreviewSection title="Basic Information">
        <PreviewField
          label="Date In"
          value={new Date(data.dateIn).toLocaleDateString()}
        />
        <PreviewField
          label="Time In"
          value={new Date(data.timeIn).toLocaleTimeString()}
        />
        {data.dateOut && (
          <PreviewField
            label="Date Out"
            value={new Date(data.dateOut).toLocaleDateString()}
          />
        )}
        {data.timeOut && (
          <PreviewField
            label="Time Out"
            value={new Date(data.timeOut).toLocaleTimeString()}
          />
        )}
      </PreviewSection>

      <PreviewSection title="Vehicle Information">
        <PreviewField label="Carrier" value={data.carrier} />
        <PreviewField label="Truck License No." value={data.truckLicenseNo} />
        <PreviewField label="Truck No." value={data.truckNo} />
        <PreviewField
          label="Trailer License No."
          value={data.trailerLicenseNo}
        />
        <PreviewField label="Trailer No." value={data.trailerNo} />
      </PreviewSection>

      <PreviewSection title="Personnel Information">
        <PreviewField label="Operator Name" value={data.operatorName} />
        <PreviewField label="Passenger Name" value={data.passengerName} />
        <PreviewField label="Security Officer" value={data.securityOfficer} />
      </PreviewSection>

      <PreviewSection title="Purpose and Sealing">
        <PreviewField label="Purpose" value={data.purpose} />
        <PreviewField label="Sealed" value={data.sealed} />
        <PreviewField label="Seal No. 1" value={data.sealNo1} />
        <PreviewField label="Seal No. 2" value={data.sealNo2} />
        <div className="col-span-2">
          <PreviewField label="Remarks" value={data.remarks} />
        </div>
      </PreviewSection>

      <PreviewSection title="Release Information">
        <PreviewField label="Release Remarks" value={data.releaseRemarks} />
        <PreviewField label="Trailer Type" value={data.trailerType} />
        <PreviewField
          label="Release Trailer No."
          value={data.releaseTrailerNo}
        />
        <PreviewField label="Destination" value={data.destination} />
        <PreviewField label="Release Seal No." value={data.releaseSealNo} />
        <PreviewField label="Vehicle Inspected" value={data.vehicleInspected} />
        <PreviewField label="Vest Returned" value={data.vestReturned} />
      </PreviewSection>

      <div className="border-t pt-6">
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
