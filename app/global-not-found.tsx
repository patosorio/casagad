import type { Metadata } from "next";
import { headers } from "next/headers";
import { NotFoundDocument } from "@/components/site/NotFoundDocument";
import { notFoundMetadata } from "@/components/site/NotFoundContent";
import { defaultLocale, isLocale, LOCALE_HEADER, type Locale } from "@/lib/i18n/config";
import { NONCE_HEADER } from "@/lib/security/csp";
import "./globals.css";

/** Reads locale and nonce from the request, so this route cannot be a static shell. */
export const instant = false;

function localeFromHeader(value: string | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const value = (await headers()).get(LOCALE_HEADER);
  return notFoundMetadata(localeFromHeader(value), true);
}

/** Next 16 serves this when a URL matches no route and `globalNotFound` is on. */
export default async function GlobalNotFound() {
  const headerList = await headers();
  const nonce = headerList.get(NONCE_HEADER) ?? undefined;
  const locale = localeFromHeader(headerList.get(LOCALE_HEADER));
  return <NotFoundDocument locale={locale} nonce={nonce} />;
}
