import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import {
  HTML_NO_STORE_SOURCE,
  ICAL_CACHE,
  IMMUTABLE_STATIC,
  NOINDEX_NOFOLLOW,
  PRIVATE_NO_STORE,
  bookingResultPaths,
  headerRules,
} from "@/lib/security/response-headers";

type PathToRegexp = (
  path: string,
  keys: unknown[],
  options: { strict: boolean; sensitive: boolean; delimiter: string },
) => RegExp;

function compile(source: string): RegExp {
  const require = createRequire(import.meta.url);
  const loaded: unknown = require("next/dist/compiled/path-to-regexp");
  if (!isPathToRegexpModule(loaded)) throw new Error("path-to-regexp export missing");
  const compiled = loaded.pathToRegexp(source, [], {
    strict: true,
    sensitive: false,
    delimiter: "/",
  });
  const normalized = compiled.source.replace(/\$$/, "(?:\\/)?$").replace(/\\\//g, "/");
  return new RegExp(normalized);
}

function isPathToRegexpModule(value: unknown): value is { pathToRegexp: PathToRegexp } {
  if (typeof value !== "object" || value === null || !("pathToRegexp" in value)) return false;
  return typeof value.pathToRegexp === "function";
}

describe("response header rules", () => {
  it("sets the security headers on every path", () => {
    const all = headerRules().find((rule) => rule.source === "/:path*");
    expect(all?.headers).toEqual([
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
    ]);
  });

  it("keeps HTML no-store, and noindex on admin and booking results", () => {
    const rules = headerRules();
    expect(rules.find((rule) => rule.source === HTML_NO_STORE_SOURCE)?.headers).toEqual([
      { key: "Cache-Control", value: PRIVATE_NO_STORE },
    ]);
    expect(rules.find((rule) => rule.source === "/admin/:path*")?.headers).toEqual([
      { key: "Cache-Control", value: PRIVATE_NO_STORE },
      { key: "X-Robots-Tag", value: NOINDEX_NOFOLLOW },
    ]);
    for (const path of bookingResultPaths) {
      expect(rules.find((rule) => rule.source === path)?.headers).toEqual([
        { key: "Cache-Control", value: PRIVATE_NO_STORE },
        { key: "X-Robots-Tag", value: NOINDEX_NOFOLLOW },
      ]);
    }
    expect(rules.at(-1)).toEqual({
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: IMMUTABLE_STATIC }],
    });
    expect(rules.find((rule) => rule.source === "/calendar/:token.ics")?.headers).toEqual([
      { key: "Cache-Control", value: ICAL_CACHE },
    ]);
  });

  it("matches HTML, and not static files or calendar feeds, for no-store", () => {
    const html = compile(HTML_NO_STORE_SOURCE);
    expect(html.test("/")).toBe(true);
    expect(html.test("/la-casa/")).toBe(true);
    expect(html.test("/en/the-house/")).toBe(true);
    expect(html.test("/xyz/")).toBe(true);
    expect(html.test("/en/xyz/")).toBe(true);
    expect(html.test("/admin/")).toBe(true);
    expect(html.test("/prenota/richiesta-inviata/")).toBe(true);
    expect(html.test("/fonts/Jost-normal-latin.woff2")).toBe(false);
    expect(html.test("/images/house.jpg")).toBe(false);
    expect(html.test("/favicon.ico")).toBe(false);
    expect(html.test("/_next/static/chunks/app.js")).toBe(false);
    expect(html.test("/_next/image/")).toBe(false);
    expect(html.test("/calendar/token.ics")).toBe(false);
  });

  it("matches admin, booking results, feeds, and hashed static files", () => {
    expect(compile("/admin/:path*").test("/admin/")).toBe(true);
    expect(compile("/admin/:path*").test("/administrator/")).toBe(false);
    for (const path of bookingResultPaths) {
      expect(compile(path).test(`${path}/`), path).toBe(true);
    }
    expect(compile("/calendar/:token.ics").test("/calendar/abc.ics")).toBe(true);
    expect(compile("/calendar/:token.ics").test("/calendar/abc.txt")).toBe(false);
    expect(compile("/_next/static/:path*").test("/_next/static/chunks/app.js")).toBe(true);
  });
});
