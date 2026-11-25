import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

/** Booking landing pages stay allowed. Only the later steps are disallowed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/prenota/*/", "/en/book/*/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
