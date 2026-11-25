import { NotFoundContent } from "@/components/site/NotFoundContent";
import { PublicChrome } from "@/components/site/PublicChrome";
import type { Locale } from "@/lib/i18n/config";
import { fontVariableClassName } from "@/lib/fonts";

/**
 * Full 404 document for an unmatched URL. There is no root layout to wrap it.
 * `noindex` is also set by metadata on `app/global-not-found.tsx`.
 */
export function NotFoundDocument({ locale, nonce }: { locale: Locale; nonce?: string }) {
  return (
    <html lang={locale} className={`${fontVariableClassName} h-full antialiased`} nonce={nonce}>
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body className="flex min-h-full flex-col bg-bianco font-body text-body text-inchiostro">
        <PublicChrome locale={locale}>
          <NotFoundContent locale={locale} />
        </PublicChrome>
      </body>
    </html>
  );
}
