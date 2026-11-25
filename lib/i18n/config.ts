import type { InitOptions } from "i18next";

/** Italian is the default and stays unprefixed. English lives under `/en/`. */
export const locales = ["it", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";

/** Request header set by proxy.ts. The URL is the source; the client value is overwritten. */
export const LOCALE_HEADER = "x-casagad-locale";

/** Namespaces that exist in both languages. The English key tree must match Italian. */
export const publicNamespaces = ["common", "site", "booking", "errors"] as const;

export type PublicNamespace = (typeof publicNamespaces)[number];

/** `admin` is Italian only until an English admin is explicitly added. */
export const namespaces = [...publicNamespaces, "admin"] as const;

export type Namespace = (typeof namespaces)[number];

/** Header and footer islands. Pages pass a smaller or equal set. */
export const shellNamespaces = ["common", "site"] as const satisfies readonly Namespace[];

/** Explicit Intl locale. English is en-GB. Currency stays EUR either way. */
export const intlLocale = {
  it: "it-IT",
  en: "en-GB",
} as const;

export function intlLocaleFor(locale: Locale): (typeof intlLocale)[Locale] {
  return intlLocale[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * i18next calls `missingKeyHandler` only when `saveMissing` is on.
 * Dev and test turn that on and throw, and there is no backend to write keys.
 * Production leaves `saveMissing` off. `parseMissingKeyHandler` throws in dev
 * and test as well, so a missing key cannot render as the raw key.
 */
export function onMissingKey(lngs: readonly string[], ns: string, key: string): void {
  if (process.env.NODE_ENV === "production") return;
  throw new Error(`Missing i18n key: ${ns}:${key} (${lngs.join(",")})`);
}

export function onParseMissingKey(key: string): string {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(`Missing i18n key: ${key}`);
  }
  return key;
}

/** Shared init for a brand-new instance. Resources are added by the caller. */
export function i18nInitOptions(locale: Locale, ns: readonly Namespace[]): InitOptions {
  const first = ns[0] ?? "common";
  return {
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    ns: [...ns],
    defaultNS: first,
    initAsync: false,
    returnNull: false,
    partialBundledLanguages: true,
    saveMissing: process.env.NODE_ENV !== "production",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    missingKeyHandler(lngs, namespace, key) {
      onMissingKey(lngs, namespace, key);
    },
    parseMissingKeyHandler(key) {
      return onParseMissingKey(key);
    },
  };
}
