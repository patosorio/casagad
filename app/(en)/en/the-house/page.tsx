import type { Metadata } from "next";
import { HousePage } from "@/components/site/pages/HousePage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "house");
}

export default function Page() {
  return <HousePage locale="en" />;
}
