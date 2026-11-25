import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "book");
}

export default function EnglishBookPage() {
  return <PublicPage locale="en" page="book" />;
}
