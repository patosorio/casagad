import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "location");
}

export default function EnglishLocationPage() {
  return <PublicPage locale="en" page="location" />;
}
