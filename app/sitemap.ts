import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates } from "@/lib/seo/metadata";
import { routes, type RouteKey } from "@/lib/i18n/routes";

const pages = Object.keys(routes) as RouteKey[];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const languages = {
      it: absoluteUrl(languageAlternates(page).it),
      en: absoluteUrl(languageAlternates(page).en),
      "x-default": absoluteUrl(languageAlternates(page)["x-default"]),
    };
    return [
      { url: absoluteUrl(routes[page].it), alternates: { languages } },
      { url: absoluteUrl(routes[page].en), alternates: { languages } },
    ];
  });
}
