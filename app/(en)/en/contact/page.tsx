import type { Metadata } from "next";
import { ContactPage } from "@/components/site/pages/ContactPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "contact");
}

export default function Page() {
  return <ContactPage locale="en" />;
}
