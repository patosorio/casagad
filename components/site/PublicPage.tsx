import type { Metadata } from "next";
import type { TFunction } from "i18next";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { RouteKey } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";

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

export async function publicPageMetadata(locale: Locale, page: RouteKey): Promise<Metadata> {
  const t = await getT(locale, "site");
  return { title: pageHeading(t, page) };
}

export async function PublicPage({ locale, page }: { locale: Locale; page: RouteKey }) {
  const t = await getT(locale, "site");
  return (
    <Container className="py-14">
      <h1>{pageHeading(t, page)}</h1>
    </Container>
  );
}
