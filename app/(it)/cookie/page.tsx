import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "cookies");
}

export default function ItalianCookiesPage() {
  return <PublicPage locale="it" page="cookies" />;
}
