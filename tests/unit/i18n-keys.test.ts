import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  intlLocaleFor,
  onMissingKey,
  onParseMissingKey,
  publicNamespaces,
  type PublicNamespace,
} from "@/lib/i18n/config";
import { createI18n, getT } from "@/lib/i18n/server";
import bookingEn from "@/locales/en/booking.json";
import commonEn from "@/locales/en/common.json";
import errorsEn from "@/locales/en/errors.json";
import siteEn from "@/locales/en/site.json";
import bookingIt from "@/locales/it/booking.json";
import commonIt from "@/locales/it/common.json";
import errorsIt from "@/locales/it/errors.json";
import siteIt from "@/locales/it/site.json";

const italian = {
  common: commonIt,
  site: siteIt,
  booking: bookingIt,
  errors: errorsIt,
} satisfies Record<PublicNamespace, unknown>;

const english = {
  common: commonEn,
  site: siteEn,
  booking: bookingEn,
  errors: errorsEn,
} satisfies Record<PublicNamespace, unknown>;

function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix === "" ? [] : [prefix];
  }

  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return prefix === "" ? [] : [prefix];
  return entries.flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe("i18n catalogues", () => {
  it("keeps the English key tree equal to Italian for every public namespace", () => {
    for (const ns of publicNamespaces) {
      expect(keyPaths(english[ns]), ns).toEqual(keyPaths(italian[ns]));
    }
  });

  it("formats with it-IT and en-GB", () => {
    expect(intlLocaleFor("it")).toBe("it-IT");
    expect(intlLocaleFor("en")).toBe("en-GB");
  });

  it("throws from the missing-key handlers outside production", () => {
    expect(() => onMissingKey(["it"], "common", "missing.key")).toThrow(
      "Missing i18n key: common:missing.key (it)",
    );
    expect(() => onParseMissingKey("missing.key")).toThrow("Missing i18n key: missing.key");
  });

  it("installs those handlers on a new instance and does not reuse the instance", async () => {
    const italianInstance = await createI18n("it", ["site"]);
    const englishInstance = await createI18n("en", ["site"]);
    expect(italianInstance).not.toBe(englishInstance);
    expect(italianInstance.language).toBe("it");
    expect(englishInstance.language).toBe("en");
    expect(englishInstance.options.saveMissing).toBe(true);

    const missing = englishInstance.options.missingKeyHandler;
    const parse = englishInstance.options.parseMissingKeyHandler;
    if (typeof missing !== "function" || typeof parse !== "function") {
      throw new Error("missing key handlers were not installed");
    }
    expect(() => missing(["en"], "site", "missing.key", "missing.key", false, {})).toThrow(
      "Missing i18n key: site:missing.key (en)",
    );
    expect(() => parse("missing.key")).toThrow("Missing i18n key: missing.key");

    const italianText = await getT("it", "site");
    const englishText = await getT("en", "site");
    expect(italianText("pages.contact.h1")).toBe("Contatti");
    expect(englishText("pages.contact.h1")).toBe("Contact");
    expect(italianText("pages.contact.h1")).toBe("Contatti");
  });

  it("does not use a language detector, a locale cookie, or a shared language switch", () => {
    const dir = join(process.cwd(), "lib/i18n");
    const source = readdirSync(dir)
      .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"))
      .map((name) => readFileSync(join(dir, name), "utf8"))
      .join("\n");

    expect(source).toMatch(/createInstance\(/);
    expect(source).not.toMatch(/languagedetector/i);
    expect(source).not.toMatch(/changeLanguage/);
    expect(source).not.toMatch(/document\.cookie/);
  });
});
