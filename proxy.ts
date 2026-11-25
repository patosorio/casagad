import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_HEADER } from "@/lib/i18n/config";
import { localeFromPath } from "@/lib/i18n/routes";

/**
 * Sets the locale header from the URL before any page renders.
 * Prompt 04 adds the nonce and CSP to this file. Keep this step first.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, localeFromPath(request.nextUrl.pathname));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
