import { locales, type Locale } from "@/lib/i18n/config";

/**
 * Public URLs with a trailing slash, matching `trailingSlash: true` (TS-03).
 * Italian is unprefixed. English is under `/en/`. Cookie is `/cookie/` in
 * Italian and `/en/cookies/` in English.
 */
export const routes = {
  home: { it: "/", en: "/en/" },
  house: { it: "/la-casa/", en: "/en/the-house/" },
  photos: { it: "/foto/", en: "/en/photos/" },
  location: { it: "/dove-siamo/", en: "/en/location/" },
  book: { it: "/prenota/", en: "/en/book/" },
  info: { it: "/informazioni/", en: "/en/good-to-know/" },
  contact: { it: "/contatti/", en: "/en/contact/" },
  privacy: { it: "/privacy/", en: "/en/privacy/" },
  cookies: { it: "/cookie/", en: "/en/cookies/" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Header order from the approved G4 HTML. */
export const primaryNav = ["house", "photos", "location", "info", "contact", "book"] as const satisfies readonly RouteKey[];

/** Footer "Sito" column order from the approved G4 HTML. */
export const footerNav = ["house", "photos", "location", "book", "info", "contact"] as const satisfies readonly RouteKey[];

const pathIndex = new Map<string, RouteKey>();

for (const key of Object.keys(routes) as RouteKey[]) {
  for (const locale of locales) {
    pathIndex.set(canonicalPath(routes[key][locale]), key);
  }
}

/** Strip a trailing slash except on `/`, so `/en/` and `/en` match the same page. */
export function canonicalPath(pathname: string): string {
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeading.length > 1 && withLeading.endsWith("/")) {
    return withLeading.slice(0, -1);
  }
  return withLeading;
}

function withTrailingSlash(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function routeKeyFromPath(pathname: string): RouteKey | null {
  return pathIndex.get(canonicalPath(pathname)) ?? null;
}

/**
 * Locale for the proxy header. `/en` and `/en/…` are English.
 * `/enx/` stays Italian: the prefix is a segment, not a string prefix.
 */
export function localeFromPath(pathname: string): Locale {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "it";
}

/**
 * Equivalent path in the other language.
 * Known pages use the table. An unknown path keeps its slug and swaps the
 * `/en` prefix, so a 404 stays a 404. Admin stays on the Italian path.
 */
export function alternatePath(pathname: string, target: Locale): string {
  const canon = canonicalPath(pathname);
  const known = pathIndex.get(canon);
  if (known) return routes[known][target];

  if (canon === "/admin" || canon.startsWith("/admin/")) {
    return withTrailingSlash(canon);
  }

  const english = canon === "/en" || canon.startsWith("/en/");
  if (target === "en") {
    if (english) return withTrailingSlash(canon);
    if (canon === "/") return routes.home.en;
    return withTrailingSlash(`/en${canon}`);
  }

  if (!english) return withTrailingSlash(canon);
  const rest = canon.slice("/en".length);
  if (rest === "") return routes.home.it;
  return withTrailingSlash(rest);
}

/** Keep the query string and hash when building a language-switch href. */
export function hrefWithLocation(path: string, search: string, hash: string): string {
  const query = search === "" ? "" : search.startsWith("?") ? search : `?${search}`;
  const fragment = hash === "" ? "" : hash.startsWith("#") ? hash : `#${hash}`;
  return `${path}${query}${fragment}`;
}
