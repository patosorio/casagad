import type { Metadata } from "next";
import { LegalPage } from "@/components/site/pages/LegalPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "cookies");
}

export default function Page() {
  return <LegalPage locale="en" page="cookies" />;
}
