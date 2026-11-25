import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "home");
}

export default function ItalianHomePage() {
  return <PublicPage locale="it" page="home" />;
}
