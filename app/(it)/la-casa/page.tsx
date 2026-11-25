import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "house");
}

export default function ItalianHousePage() {
  return <PublicPage locale="it" page="house" />;
}
