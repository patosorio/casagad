import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "photos");
}

export default function EnglishPhotosPage() {
  return <PublicPage locale="en" page="photos" />;
}
