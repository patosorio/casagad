import type { Metadata } from "next";
import { BookPage } from "@/components/site/pages/BookPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "book");
}

export default function Page() {
  return <BookPage locale="en" />;
}
