import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "house");
}

export default function EnglishHousePage() {
  return <PublicPage locale="en" page="house" />;
}
