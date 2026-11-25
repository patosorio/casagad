import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("it", "contact");
}

export default function ItalianContactPage() {
  return <PublicPage locale="it" page="contact" />;
}
