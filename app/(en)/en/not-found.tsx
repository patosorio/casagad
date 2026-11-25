/** In-page `notFound()` only. An unknown URL never reaches this file. See Prompt 00 "404s". */
import type { Metadata } from "next";
import { NotFoundContent, notFoundMetadata } from "@/components/site/NotFoundContent";

export function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata("en");
}

export default function EnglishNotFound() {
  return <NotFoundContent locale="en" />;
}
