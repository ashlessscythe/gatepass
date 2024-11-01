"use client";

import Image from "next/image";
import { Gatepass } from "@/types/gatepass";
import { formatDate, formatTime } from "@/lib/utils";
import { GatepassStatus } from "@prisma/client";

interface PreviewFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

function PreviewField({ label, value }: PreviewFieldProps) {
  if (value === null || value === undefined) return null;
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </dd>
    </div>
  );
}

interface SignaturePreviewProps {
  label: string;
  signature: string | null;
}

function SignaturePreview({ label, signature }: SignaturePreviewProps) {
  // Check if signature is a valid data URL or URL
  const isValidSignature =
    signature?.startsWith("data:image/") || signature?.startsWith("http");

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {signature && isValidSignature ? (
        <div className="border rounded-md p-2 bg-card">
          <div className="relative h-[100px]">
            <Image
              src={signature}
              alt={`${label} signature`}
              fill
              className="object-contain"
              unoptimized // Disable Next.js image optimization for data URLs
            />
          </div>
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">No signature</p>
      )}
    </div>
  );
}

interface GatepassPreviewProps {
  data: Gatepass;
}

export function GatepassPreview({ data }: GatepassPreviewProps) {
  const status = data.status || GatepassStatus.PENDING;
  const statusDisplay = status.toLowerCase().replace("_", " ");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Gatepass #{data.formNumber}
          </h2>
          <p className="text-sm text-muted-foreground">
            Created by {data.createdBy?.name || "Unknown"}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === GatepassStatus.COMPLETED
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : status === GatepassStatus.PENDING
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              : status === GatepassStatus.CANCELLED
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              : status === GatepassStatus.LOADING
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {statusDisplay}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Timing</h3>
          <div className="space-y-2">
            <PreviewField label="Date In" value={formatDate(data.dateIn)} />
            <PreviewField label="Time In" value={formatTime(data.timeIn)} />
            {data.dateOut && (
              <PreviewField label="Date Out" value={formatDate(data.dateOut)} />
            )}
            {data.timeOut && (
              <PreviewField label="Time Out" value={formatTime(data.timeOut)} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Vehicle Details</h3>
          <div className="space-y-2">
            <PreviewField label="Carrier" value={data.carrier} />
            <PreviewField label="Truck License" value={data.truckLicenseNo} />
            <PreviewField label="Truck No." value={data.truckNo} />
            <PreviewField
              label="Trailer License"
              value={data.trailerLicenseNo}
            />
            <PreviewField label="Trailer No." value={data.trailerNo} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Personnel</h3>
          <div className="space-y-2">
            <PreviewField label="Operator" value={data.operatorName} />
            <PreviewField label="Passenger" value={data.passengerName} />
            <PreviewField
              label="Security Officer"
              value={data.securityOfficer}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Purpose & Status</h3>
          <div className="space-y-2">
            <PreviewField label="Purpose" value={data.purpose} />
            <PreviewField label="BOL Number" value={data.bolNumber} />
            <PreviewField label="Pickup Door" value={data.pickupDoor} />
            <PreviewField label="Sealed" value={data.sealed} />
            <PreviewField label="Seal No. 1" value={data.sealNo1} />
            <PreviewField label="Seal No. 2" value={data.sealNo2} />
            <PreviewField label="Remarks" value={data.remarks} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Release Information</h3>
          <div className="space-y-2">
            <PreviewField label="Release Remarks" value={data.releaseRemarks} />
            <PreviewField label="Trailer Type" value={data.trailerType} />
            <PreviewField
              label="Release Trailer No."
              value={data.releaseTrailerNo}
            />
            <PreviewField label="Destination" value={data.destination} />
            <PreviewField
              label="Vehicle Inspected"
              value={data.vehicleInspected}
            />
            <PreviewField label="Release Seal No." value={data.releaseSealNo} />
            <PreviewField label="Vest Returned" value={data.vestReturned} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Signatures</h3>
          <div className="space-y-4">
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
      </div>
    </div>
  );
}
