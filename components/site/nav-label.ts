import type { TFunction } from "i18next";

type NavKey = "house" | "photos" | "location" | "info" | "contact" | "book";

export function navLabel(t: TFunction<"site">, key: NavKey): string {
  switch (key) {
    case "house":
      return t("nav.house");
    case "photos":
      return t("nav.photos");
    case "location":
      return t("nav.location");
    case "info":
      return t("nav.info");
    case "contact":
      return t("nav.contact");
    case "book":
      return t("nav.book");
  }
}
