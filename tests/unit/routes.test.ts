import { describe, expect, it } from "vitest";
import { alternatePath, hrefWithLocation, localeFromPath, routes, type RouteKey } from "@/lib/i18n/routes";

const keys = Object.keys(routes) as RouteKey[];

describe("public routes", () => {
  it("gives every key an Italian path and an English path", () => {
    const seen = new Set<string>();

    for (const key of keys) {
      const route = routes[key];
      expect(route.it.endsWith("/"), key).toBe(true);
      expect(route.en.endsWith("/"), key).toBe(true);
      expect(route.en.startsWith("/en/"), key).toBe(true);
      expect(route.it.startsWith("/en"), key).toBe(false);
      expect(seen.has(route.it), route.it).toBe(false);
      expect(seen.has(route.en), route.en).toBe(false);
      seen.add(route.it);
      seen.add(route.en);
    }
  });

  it("round-trips the language switch, with or without the trailing slash", () => {
    for (const key of keys) {
      const route = routes[key];
      expect(alternatePath(route.it, "en"), key).toBe(route.en);
      expect(alternatePath(route.en, "it"), key).toBe(route.it);
      expect(alternatePath(alternatePath(route.it, "en"), "it"), key).toBe(route.it);

      const italianWithoutSlash = route.it === "/" ? "/" : route.it.slice(0, -1);
      const englishWithoutSlash = route.en.slice(0, -1);
      expect(alternatePath(italianWithoutSlash, "en"), key).toBe(route.en);
      expect(alternatePath(englishWithoutSlash, "it"), key).toBe(route.it);
    }

    expect(alternatePath("/xyz/", "en")).toBe("/en/xyz/");
    expect(alternatePath("/en/xyz/", "it")).toBe("/xyz/");
    expect(alternatePath(alternatePath("/not-a-page/", "en"), "it")).toBe("/not-a-page/");
    expect(alternatePath("/admin/", "en")).toBe("/admin/");
    expect(alternatePath("/admin/prenotazioni/", "en")).toBe("/admin/prenotazioni/");
  });

  it("keeps the query string and the hash on the switched href", () => {
    expect(hrefWithLocation(alternatePath("/prenota/", "en"), "from=2026-07-01&guests=4", "#dates")).toBe(
      "/en/book/?from=2026-07-01&guests=4#dates",
    );
    expect(hrefWithLocation(alternatePath("/en/book/", "it"), "?from=2026-07-01", "dates")).toBe(
      "/prenota/?from=2026-07-01#dates",
    );
    expect(hrefWithLocation("/en/", "", "")).toBe("/en/");
  });

  it("reads the locale from the path for the proxy header", () => {
    expect(localeFromPath("/")).toBe("it");
    expect(localeFromPath("/xyz/")).toBe("it");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/")).toBe("en");
    expect(localeFromPath("/en/xyz/")).toBe("en");
    expect(localeFromPath("/enx/")).toBe("it");
  });
});
