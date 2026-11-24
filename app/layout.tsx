import type { Metadata } from "next";
import { fontVariableClassName } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Gad",
  description: "Casa Gad",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${fontVariableClassName} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bianco font-body text-body text-inchiostro">
        {children}
      </body>
    </html>
  );
}
