import type { Metadata } from "next";
import { HomePage } from "@/components/site/pages/HomePage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "home");
}

export default function EnglishHomePage() {
  return <HomePage locale="en" />;
}
