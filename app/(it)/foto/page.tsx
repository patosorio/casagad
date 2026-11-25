import type { Metadata } from "next";
import { PhotosPage } from "@/components/site/pages/PhotosPage";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("it", "photos");
}

export default function Page() {
  return <PhotosPage locale="it" />;
}
