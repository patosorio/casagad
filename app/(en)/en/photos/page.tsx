import type { Metadata } from "next";
import { PhotosPage } from "@/components/site/pages/PhotosPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "photos");
}

export default function Page() {
  return <PhotosPage locale="en" />;
}
