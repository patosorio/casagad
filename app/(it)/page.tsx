import type { Metadata } from "next";
import { HomePage } from "@/components/site/pages/HomePage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("it", "home");
}

export default function ItalianHomePage() {
  return <HomePage locale="it" />;
}
