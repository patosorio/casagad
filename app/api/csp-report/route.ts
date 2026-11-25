import { NextResponse } from "next/server";
import { handleCspReport } from "@/server/security/csp-report";

/** Browsers POST a report here. The body is logged redacted, then discarded. */
export async function POST(request: Request) {
  try {
    await handleCspReport(request);
  } catch {
    // A malformed report stays a 204. The handler already skips the body.
  }
  return new NextResponse(null, { status: 204 });
}
