import type { Metadata } from "next";
import { LocationPage } from "@/components/site/pages/LocationPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "location");
}

export default function Page() {
  return <LocationPage locale="en" />;
}
