import { describe, expect, it } from "vitest";
import { bookingResultPaths } from "@/lib/security/response-headers";

const origin = process.env.CASAGAD_ORIGIN ?? "http://127.0.0.1:3000";
const enabled = process.env.CASAGAD_HEADERS_TEST === "1";

async function get(path: string): Promise<Response> {
  try {
    return await fetch(`${origin}${path}`, { cache: "no-store", redirect: "manual" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "request failed";
    throw new Error(`Header checks need npm start on ${origin}. ${message}`);
  }
}

function scriptNonce(policy: string | null): string | null {
  if (policy === null) return null;
  const scriptSrc = policy.split(";").map((part) => part.trim()).find((part) => part.startsWith("script-src "));
  const match = scriptSrc?.match(/'nonce-([^']+)'/);
  return match?.[1] ?? null;
}

function expectSecurityHeaders(response: Response): void {
  expect(response.headers.get("strict-transport-security")).toBe(
    "max-age=31536000; includeSubDomains; preload",
  );
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
  expect(response.headers.get("permissions-policy")).toBe(
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  expect(response.headers.get("x-frame-options")).toBe("DENY");
  expect(response.headers.get("cross-origin-opener-policy")).toBe("same-origin-allow-popups");
}

function expectReportOnlyNonce(response: Response, html: string): string {
  expect(response.headers.get("content-security-policy")).toBeNull();
  const policy = response.headers.get("content-security-policy-report-only");
  expect(policy).toBeTruthy();
  expect(policy).not.toContain("unsafe-inline");
  expect(policy).not.toContain("unsafe-eval");
  expect(policy).toContain("'strict-dynamic'");
  expect(policy).toContain("report-uri /api/csp-report");
  const nonce = scriptNonce(policy);
  expect(nonce).toBeTruthy();
  expect(html).toContain(`nonce="${nonce}"`);
  return nonce ?? "";
}

describe.skipIf(!enabled)("response headers against npm start", () => {
  it("gives each HTML response a fresh report-only nonce", async () => {
    const first = await get("/");
    const firstHtml = await first.text();
    const second = await get("/");
    const secondHtml = await second.text();

    expect(first.status).toBe(200);
    expectSecurityHeaders(first);
    expect(first.headers.get("cache-control")).toContain("private");
    expect(first.headers.get("cache-control")).toContain("no-store");
    const nonceA = expectReportOnlyNonce(first, firstHtml);
    const nonceB = expectReportOnlyNonce(second, secondHtml);
    expect(nonceA).not.toBe(nonceB);
  });

  it("keeps the locale header on unknown URLs and still nonces them", async () => {
    const italian = await get("/xyz/");
    const italianHtml = await italian.text();
    const english = await get("/en/xyz/");
    const englishHtml = await english.text();

    expect(italian.status).toBe(404);
    expect(english.status).toBe(404);
    expect(italianHtml).toContain('lang="it"');
    expect(englishHtml).toContain('lang="en"');
    expect(italianHtml).not.toContain("__next_error__");
    expect(englishHtml).not.toContain("__next_error__");
    expectReportOnlyNonce(italian, italianHtml);
    expectReportOnlyNonce(english, englishHtml);
    expect(italian.headers.get("cache-control")).toContain("no-store");
  });

  it("marks admin and booking result paths no-store and noindex", async () => {
    const admin = await get("/admin/");
    const adminHtml = await admin.text();
    expect(admin.status).toBe(200);
    expect(admin.headers.get("cache-control")).toContain("private");
    expect(admin.headers.get("cache-control")).toContain("no-store");
    expect(admin.headers.get("x-robots-tag")).toContain("noindex");
    expect(admin.headers.get("x-robots-tag")).toContain("nofollow");
    expectReportOnlyNonce(admin, adminHtml);

    for (const path of bookingResultPaths) {
      const response = await get(`${path}/`);
      expect(response.headers.get("cache-control"), path).toContain("no-store");
      expect(response.headers.get("x-robots-tag"), path).toContain("noindex");
      expect(response.headers.get("x-robots-tag"), path).toContain("nofollow");
      expect(response.headers.get("content-security-policy-report-only"), path).toContain("'nonce-");
    }
  });

  it("caches hashed static files and leaves excluded paths without a CSP", async () => {
    const home = await get("/");
    const html = await home.text();
    const asset = html.match(/\/_next\/static\/[^"'\s]+/)?.[0];
    expect(asset).toBeTruthy();
    const file = await get(asset ?? "/");
    expect(file.status).toBe(200);
    const cache = file.headers.get("cache-control") ?? "";
    expect(cache).toContain("public");
    expect(cache).toContain("max-age=31536000");
    expect(cache).toContain("immutable");
    expect(file.headers.get("content-security-policy-report-only")).toBeNull();

    const font = await get("/fonts/Jost-normal-latin.woff2");
    expect(font.status).toBe(200);
    expect(font.headers.get("content-security-policy-report-only")).toBeNull();
    expect(font.headers.get("cache-control") ?? "").not.toContain("no-store");

    for (const path of ["/api/stripe/webhook", "/api/internal/ping", "/calendar/sample.ics"]) {
      const response = await get(path);
      expect(response.headers.get("content-security-policy-report-only"), path).toBeNull();
    }

    // No feed route exists yet, so this is the dynamic 404. Next replaces
    // Cache-Control on that 404. The feed rule itself is `private, max-age=300`.
    const feed = await get("/calendar/sample.ics");
    expect(feed.status).toBe(404);
    expect(feed.headers.get("cache-control") ?? "").toContain("private");
  });

  it("accepts a CSP report with 204", async () => {
    const response = await fetch(`${origin}/api/csp-report`, {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/csp-report" },
      body: JSON.stringify({
        "csp-report": {
          "effective-directive": "script-src",
          "blocked-uri": "inline",
          disposition: "report",
        },
      }),
    });
    expect(response.status).toBe(204);
  });
});
