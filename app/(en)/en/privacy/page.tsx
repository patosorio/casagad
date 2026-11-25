import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "privacy");
}

export default function EnglishPrivacyPage() {
  return <PublicPage locale="en" page="privacy" />;
}
