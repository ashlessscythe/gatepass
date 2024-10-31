"use client";

import Image from "next/image";
import { GatepassData } from "@/types/gatepass";

interface GatepassPreviewProps {
  data: GatepassData;
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
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
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "-"}
      </p>
    </div>
  );
}

function SignaturePreview({
  label,
  signature,
}: {
  label: string;
  signature: string | null;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {signature ? (
        <div className="border rounded-md p-2 bg-card">
          <div className="relative h-[100px]">
            <Image
              src={signature}
              alt={`${label} signature`}
              fill
              className="object-contain"
              unoptimized // Since this is a data URL
            />
          </div>
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">No signature</p>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string) {
  return new Date(timeStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GatepassPreview({ data }: GatepassPreviewProps) {
  return (
    <div className="space-y-8 bg-card p-6 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Gate Pass{" "}
            <span className="text-primary">
              #{data.formNumber || "PREVIEW"}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Created by {data.createdBy?.name || "Unknown"} on{" "}
            {formatDate(data.createdAt)}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full
          ${
            data.status === "COMPLETED"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : data.status === "IN_PROGRESS"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              : data.status === "CANCELLED"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {data.status.toLowerCase()}
        </span>
      </div>

      <PreviewSection title="Basic Information">
        <PreviewField label="Date In" value={formatDate(data.dateIn)} />
        <PreviewField label="Time In" value={formatTime(data.timeIn)} />
        {data.dateOut && (
          <PreviewField label="Date Out" value={formatDate(data.dateOut)} />
        )}
        {data.timeOut && (
          <PreviewField label="Time Out" value={formatTime(data.timeOut)} />
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Signatures</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SignaturePreview
            label="Receiver's Signature"
            signature={data.receiverSignature}
          />
          <SignaturePreview
            label="Shipper's Signature"
            signature={data.shipperSignature}
          />
          <SignaturePreview
            label="Security Officer's Signature"
            signature={data.securitySignature}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
