import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { confirmedCin, footerCin, reviewQuotes } from "@/lib/content/house";
import { imageCatalog, manifestEntry, outputWidthsFor } from "@/lib/content/photos";
import { routes, type RouteKey } from "@/lib/i18n/routes";
import siteEn from "@/locales/en/site.json";
import siteIt from "@/locales/it/site.json";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqLd, vacationRentalLd } from "@/lib/seo/jsonld";

const root = process.cwd();
const pages = Object.keys(routes) as RouteKey[];

function nestedNames(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.name.includes("[")) found.push(full);
    if (entry.isDirectory()) found.push(...nestedNames(full));
  }
  return found;
}

describe("public page facts", () => {
  it("keeps unconfirmed CIN and review quotes out of the render data", () => {
    expect(confirmedCin).toBe("");
    expect(reviewQuotes).toEqual([]);
    expect(footerCin("")).toBe("");
    expect(footerCin("   ")).toBe("");
    expect(footerCin("CIN-FROM-SETTINGS")).toBe("CIN-FROM-SETTINGS");
  });

  it("does not enlarge photos past the source width", () => {
    expect(outputWidthsFor(640)).toEqual([640]);
    expect(outputWidthsFor(2000)).toEqual([640, 1024, 1600]);
    expect(outputWidthsFor(2400)).toEqual([640, 1024, 1600, 2400]);
    expect(outputWidthsFor(100)).toEqual([100]);
  });

  it("gives every published photo an Italian and English alt", () => {
    for (const item of imageCatalog) {
      const italianAlt = siteIt.alts[item.id];
      const englishAlt = siteEn.alts[item.id];
      if (italianAlt === undefined || englishAlt === undefined) {
        throw new Error(`Missing alt for ${item.id}`);
      }
      expect(italianAlt.length).toBeGreaterThan(0);
      expect(englishAlt.length).toBeGreaterThan(0);
      const entry = manifestEntry(item.id);
      expect(entry.avif.length).toBeGreaterThan(0);
      expect(entry.webp.length).toBeGreaterThan(0);
      for (const variant of [...entry.avif, ...entry.webp]) {
        expect(variant.path.startsWith("/images/")).toBe(true);
        expect(variant.width).toBeLessThanOrEqual(entry.width);
      }
    }
  });
});

describe("public SEO", () => {
  it("sets a canonical and reciprocal hreflang on every page", async () => {
    for (const page of pages) {
      const italian = await pageMetadata("it", page);
      const english = await pageMetadata("en", page);
      expect(italian.alternates?.canonical).toBe(routes[page].it);
      expect(english.alternates?.canonical).toBe(routes[page].en);
      expect(italian.alternates?.languages).toEqual({
        it: routes[page].it,
        en: routes[page].en,
        "x-default": routes[page].it,
      });
      expect(english.alternates?.languages).toEqual(italian.alternates?.languages);
      expect(italian.title).toEqual({ absolute: expect.stringContaining("Casa Gad") });
      expect(english.title).toEqual({ absolute: expect.stringContaining("Casa Gad") });
    }
  });

  it("lists both languages in the sitemap and blocks booking steps", () => {
    const entries = sitemap();
    expect(entries.map((entry) => entry.url)).toEqual(
      expect.arrayContaining([
        "https://casagad.com/",
        "https://casagad.com/en/",
        "https://casagad.com/la-casa/",
        "https://casagad.com/en/the-house/",
      ]),
    );
    for (const entry of entries) {
      expect(entry.alternates?.languages?.["x-default"]).toBe(entry.alternates?.languages?.it);
      expect(entry.alternates?.languages?.en).toBeTruthy();
    }

    expect(robots()).toMatchObject({
      rules: { disallow: ["/admin/", "/prenota/*/", "/en/book/*/"] },
      sitemap: "https://casagad.com/sitemap.xml",
    });
  });

  it("omits address, geo, and review stars from the rental graph", () => {
    const rental = vacationRentalLd({
      name: "Casa Gad",
      description: "A house",
      path: "/",
      images: ["/images/terrazza.webp"],
      amenities: ["Wi-Fi"],
    });
    expect(rental).not.toHaveProperty("address");
    expect(rental).not.toHaveProperty("geo");
    expect(rental).not.toHaveProperty("aggregateRating");
    expect(faqLd([{ question: "Open?", answer: "" }])).toBeNull();
    expect(faqLd([{ question: "Open?", answer: "Yes" }])).toMatchObject({ "@type": "FAQPage" });
  });
});

describe("public routes", () => {
  it("has no dynamic or catch-all page routes", () => {
    expect(nestedNames(join(root, "app"))).toEqual([]);
  });

  it("does not ship placeholder or draft copy", () => {
    const banned = [
      "[GUIDO:",
      "[ASK FAMILY:",
      "[ACCOUNTANT",
      "[PATRICIA:",
      "bozza testo",
      "draft copy",
      "IT111105",
    ];
    const files = [
      join(root, "locales/it/site.json"),
      join(root, "locales/en/site.json"),
      join(root, "locales/it/common.json"),
      join(root, "locales/en/common.json"),
      join(root, "lib/content/house.ts"),
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const phrase of banned) {
        expect(source.includes(phrase), `${file} contains ${phrase}`).toBe(false);
      }
    }
  });
});
