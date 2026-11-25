import type { Metadata } from "next";
import type { TFunction } from "i18next";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { type RouteKey, routes } from "@/lib/i18n/routes";
import { photoModel, type ImageId } from "@/lib/content/photos";

export const SITE_ORIGIN = "https://casagad.com";

export function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

const ogImage: Record<RouteKey, ImageId> = {
  home: "0745",
  house: "0761",
  photos: "0745",
  location: "0749",
  book: "0745",
  info: "0748",
  contact: "0745",
  privacy: "0745",
  cookies: "0745",
};

function metaTitle(t: TFunction<"site">, page: RouteKey): string {
  switch (page) {
    case "home":
      return t("meta.home.title");
    case "house":
      return t("meta.house.title");
    case "photos":
      return t("meta.photos.title");
    case "location":
      return t("meta.location.title");
    case "book":
      return t("meta.book.title");
    case "info":
      return t("meta.info.title");
    case "contact":
      return t("meta.contact.title");
    case "privacy":
      return t("meta.privacy.title");
    case "cookies":
      return t("meta.cookies.title");
  }
}

function metaDescription(t: TFunction<"site">, page: RouteKey): string {
  switch (page) {
    case "home":
      return t("meta.home.description");
    case "house":
      return t("meta.house.description");
    case "photos":
      return t("meta.photos.description");
    case "location":
      return t("meta.location.description");
    case "book":
      return t("meta.book.description");
    case "info":
      return t("meta.info.description");
    case "contact":
      return t("meta.contact.description");
    case "privacy":
      return t("meta.privacy.description");
    case "cookies":
      return t("meta.cookies.description");
  }
}

function pageHeading(t: TFunction<"site">, page: RouteKey): string {
  switch (page) {
    case "home":
      return t("pages.home.h1");
    case "house":
      return t("pages.house.h1");
    case "photos":
      return t("pages.photos.h1");
    case "location":
      return t("pages.location.h1");
    case "book":
      return t("pages.book.h1");
    case "info":
      return t("pages.info.h1");
    case "contact":
      return t("pages.contact.h1");
    case "privacy":
      return t("pages.privacy.h1");
    case "cookies":
      return t("pages.cookies.h1");
  }
}

export function languageAlternates(page: RouteKey): Record<"it" | "en" | "x-default", string> {
  return {
    it: routes[page].it,
    en: routes[page].en,
    "x-default": routes[page].it,
  };
}

export async function pageMetadata(locale: Locale, page: RouteKey): Promise<Metadata> {
  const t = await getT(locale, "site");
  const title = metaTitle(t, page);
  const description = metaDescription(t, page);
  const canonical = routes[page][locale];
  const image = photoModel(ogImage[page]);
  const alt = pageHeading(t, page);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: languageAlternates(page),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === "it" ? "it_IT" : "en_GB",
      alternateLocale: locale === "it" ? ["en_GB"] : ["it_IT"],
      type: "website",
      images: image.src ? [{ url: image.src, width: image.width, height: image.height, alt }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}
