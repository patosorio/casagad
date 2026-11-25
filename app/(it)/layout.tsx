import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicChrome } from "@/components/site/PublicChrome";
import { fontVariableClassName } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Casa Gad",
    template: "%s | Casa Gad",
  },
};

export default function ItalianLayout({ children }: { children: ReactNode }) {
  // TODO(Prompt 04): read the per-request nonce with `(await headers()).get("x-nonce")` and pass it where Next needs it.
  return (
    <html lang="it" className={`${fontVariableClassName} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bianco font-body text-body text-inchiostro">
        <PublicChrome locale="it">{children}</PublicChrome>
      </body>
    </html>
  );
}
