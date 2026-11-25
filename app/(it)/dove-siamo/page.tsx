import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "location");
}

export default function ItalianLocationPage() {
  return <PublicPage locale="it" page="location" />;
}
