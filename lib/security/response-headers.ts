export const PRIVATE_NO_STORE = "private, no-store";

export const NOINDEX_NOFOLLOW = "noindex, nofollow";

export const IMMUTABLE_STATIC = "public, max-age=31536000, immutable";

/** iCal feeds are not HTML and are not nonced. Short private cache. */
export const ICAL_CACHE = "private, max-age=300";

/**
 * HTML, including unknown URLs. Hashed static files, the image optimizer,
 * self-hosted fonts and images, favicon, and `/calendar/` are not in this set:
 * a later rule gives `/calendar/:token.ics` and `/_next/static` their own cache.
 */
export const HTML_NO_STORE_SOURCE =
  "/:path((?!_next/static|_next/image|fonts/|images/|favicon|calendar/).*)";

/**
 * Booking result pages. They do not exist yet; the headers apply when they do,
 * and they apply to a 404 on the same path until then.
 */
export const bookingResultPaths = [
  "/prenota/richiesta-inviata",
  "/prenota/pagamento-ok",
  "/prenota/pagamento-annullato",
  "/en/book/request-sent",
  "/en/book/payment-ok",
  "/en/book/payment-cancelled",
] as const;

export const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
] as const;

type HeaderRule = {
  source: string;
  headers: { key: string; value: string }[];
};

const noStore = [{ key: "Cache-Control", value: PRIVATE_NO_STORE }];

const noStoreNoIndex = [
  { key: "Cache-Control", value: PRIVATE_NO_STORE },
  { key: "X-Robots-Tag", value: NOINDEX_NOFOLLOW },
];

/**
 * Later rules win when they set the same header name.
 * Security headers apply to every path. HTML is `private, no-store` so a nonce
 * cannot be reused from a shared cache. Admin and booking result pages are
 * also `noindex`. `/_next/static` stays immutable.
 */
export function headerRules(): HeaderRule[] {
  return [
    { source: "/:path*", headers: [...securityHeaders] },
    { source: HTML_NO_STORE_SOURCE, headers: noStore },
    { source: "/admin/:path*", headers: noStoreNoIndex },
    ...bookingResultPaths.map((source) => ({ source, headers: noStoreNoIndex })),
    {
      source: "/calendar/:token.ics",
      headers: [{ key: "Cache-Control", value: ICAL_CACHE }],
    },
    {
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: IMMUTABLE_STATIC }],
    },
  ];
}
