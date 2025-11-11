import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DEPRECATED: This endpoint is no longer used as we don't manage yard movements.
// The workflow now goes directly from BOL_VERIFIED to AT_DOOR when door is assigned.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "DISPATCH"].includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return new NextResponse(
    "This endpoint is deprecated. Use assign-door instead.",
    { status: 410 } // 410 Gone
  );
}
