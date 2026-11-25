import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "cookies");
}

export default function EnglishCookiesPage() {
  return <PublicPage locale="en" page="cookies" />;
}
