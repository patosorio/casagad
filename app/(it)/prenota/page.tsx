import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "book");
}

export default function ItalianBookPage() {
  return <PublicPage locale="it" page="book" />;
}
