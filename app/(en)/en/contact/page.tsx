import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "contact");
}

export default function EnglishContactPage() {
  return <PublicPage locale="en" page="contact" />;
}
