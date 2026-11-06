import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account Pending",
  description: "Your account is awaiting administrator approval",
};

export default function PendingPage() {
  return (
    <div className="container flex min-h-screen w-full items-start justify-center pt-12 sm:pt-24 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-md flex flex-col justify-center space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Account awaiting approval
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account has been created, but an administrator needs to approve
          it and assign your role before you can sign in. Please contact your
          administrator if this takes longer than expected.
        </p>
        <Link href="/login">
          <Button variant="outline">Back to sign in</Button>
        </Link>
      </div>
    </div>
  );
}
