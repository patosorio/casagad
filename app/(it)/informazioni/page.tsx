import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "info");
}

export default function ItalianInfoPage() {
  return <PublicPage locale="it" page="info" />;
}
