import type { Metadata } from "next";
import { headers } from "next/headers";
import { NotFoundDocument } from "@/components/site/NotFoundDocument";
import { notFoundMetadata } from "@/components/site/NotFoundContent";
import { defaultLocale, isLocale, LOCALE_HEADER, type Locale } from "@/lib/i18n/config";
import "./globals.css";

/** Reads the request header from proxy.ts, so this route cannot be a static shell. */
export const instant = false;

async function localeFromRequest(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata(await localeFromRequest(), true);
}

/** Next 16 serves this when a URL matches no route and `globalNotFound` is on. */
export default async function GlobalNotFound() {
  return <NotFoundDocument locale={await localeFromRequest()} />;
}
