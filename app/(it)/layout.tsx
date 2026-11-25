import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { PublicChrome } from "@/components/site/PublicChrome";
import { fontVariableClassName } from "@/lib/fonts";
import { NONCE_HEADER } from "@/lib/security/csp";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://casagad.com"),
  title: {
    default: "Casa Gad",
    template: "%s | Casa Gad",
  },
};

/** A nonce exists only after the request arrives, so this document cannot be a static shell. */
export const instant = false;

export default async function ItalianLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    <html lang="it" className={`${fontVariableClassName} h-full antialiased`} nonce={nonce}>
      <body className="flex min-h-full flex-col bg-bianco font-body text-body text-inchiostro">
        <PublicChrome locale="it">{children}</PublicChrome>
      </body>
    </html>
  );
}
