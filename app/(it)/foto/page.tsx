import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "photos");
}

export default function ItalianPhotosPage() {
  return <PublicPage locale="it" page="photos" />;
}
