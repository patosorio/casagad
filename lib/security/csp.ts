/** Request header the root layouts read. The proxy overwrites any client value. */
export const NONCE_HEADER = "x-nonce";

/** Report-only until the policy is checked in the browser. Not an enforcing CSP. */
export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";

/**
 * `crypto.randomUUID()` as base64. Next reads `'nonce-…'` from the report-only
 * policy on the request and stamps its own scripts with that value.
 */
export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Report-only policy. `script-src` has no `'unsafe-inline'`.
 * `'unsafe-eval'` is added only in development, where React uses `eval` for stacks.
 */
export function contentSecurityPolicy(nonce: string, isDevelopment = process.env.NODE_ENV === "development"): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    "https://www.google.com/recaptcha/",
    "https://www.gstatic.com/recaptcha/",
    "https://apis.google.com",
  ].join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://content-firebaseappcheck.googleapis.com https://www.google.com/recaptcha/",
    "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://casagad-c1f81.firebaseapp.com",
    "form-action 'self' https://checkout.stripe.com",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    // Left out while this header is report-only: browsers ignore it and still report it.
    // Put it back when the header becomes Content-Security-Policy.
    "report-uri /api/csp-report",
  ];

  return directives.join("; ");
}
