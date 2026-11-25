import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "privacy");
}

export default function ItalianPrivacyPage() {
  return <PublicPage locale="it" page="privacy" />;
}
