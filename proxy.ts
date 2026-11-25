import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_HEADER } from "@/lib/i18n/config";
import { localeFromPath } from "@/lib/i18n/routes";
import { contentSecurityPolicy, createNonce, CSP_REPORT_ONLY_HEADER, NONCE_HEADER } from "@/lib/security/csp";

/**
 * Request steps, in order:
 * 1. Locale header from the URL. Overwrites any client value.
 * 2. Per-request nonce and Content-Security-Policy-Report-Only.
 * Admin session and record-existence checks belong after these.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  applyLocaleHeader(request, requestHeaders);
  const policy = applyNonceAndCsp(requestHeaders);
  return continueWithCsp(requestHeaders, policy);
}

function applyLocaleHeader(request: NextRequest, requestHeaders: Headers): void {
  requestHeaders.set(LOCALE_HEADER, localeFromPath(request.nextUrl.pathname));
}

function applyNonceAndCsp(requestHeaders: Headers): string {
  const nonce = createNonce();
  const policy = contentSecurityPolicy(nonce);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CSP_REPORT_ONLY_HEADER, policy);
  return policy;
}

function continueWithCsp(requestHeaders: Headers, policy: string): NextResponse {
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(CSP_REPORT_ONLY_HEADER, policy);
  return response;
}

export const config = {
  // Static literal: Next reads `matcher` at build time and rejects an imported binding.
  // Skips hashed files, the image optimizer, fonts, images, favicon, iCal feeds,
  // the Stripe webhook, and internal routes. Every other path still gets a locale and a nonce.
  matcher:
    "/((?!_next/static|_next/image|fonts/|images/|favicon|calendar/[^/]+\\.ics|api/stripe/webhook|api/internal/).*)",
};
