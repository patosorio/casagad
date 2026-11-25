import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { fontVariableClassName } from "@/lib/fonts";
import { NONCE_HEADER } from "@/lib/security/csp";
import "../../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Casa Gad",
    template: "%s | Casa Gad",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/** A nonce exists only after the request arrives, so this document cannot be a static shell. */
export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    <html lang="it" className={`${fontVariableClassName} h-full antialiased`} nonce={nonce}>
      <body className="flex min-h-full flex-col bg-bianco font-body text-body text-inchiostro">
        {children}
      </body>
    </html>
  );
}
