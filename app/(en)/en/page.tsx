import type { Metadata } from "next";
import { PublicPage, publicPageMetadata } from "@/components/site/PublicPage";

export function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("en", "home");
}

export default function EnglishHomePage() {
  return <PublicPage locale="en" page="home" />;
}
