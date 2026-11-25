import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "info");
}

export default function EnglishInfoPage() {
  return <PublicPage locale="en" page="info" />;
}
