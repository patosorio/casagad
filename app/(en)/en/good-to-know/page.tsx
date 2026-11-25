import type { Metadata } from "next";
import { InfoPage } from "@/components/site/pages/InfoPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "info");
}

export default function Page() {
  return <InfoPage locale="en" />;
}
