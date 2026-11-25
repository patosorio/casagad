import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";

const primaryLink =
  "inline-flex min-h-tap items-center justify-center rounded-brand border border-inchiostro bg-inchiostro px-7 text-[15px] font-medium tracking-[0.06em] text-bianco no-underline hover:border-mare hover:bg-mare";

const secondaryLink =
  "inline-flex min-h-tap items-center justify-center rounded-brand border border-inchiostro bg-transparent px-7 text-[15px] font-medium tracking-[0.06em] text-inchiostro no-underline hover:bg-calce";

export async function notFoundMetadata(locale: Locale, absolute = false): Promise<Metadata> {
  const t = await getT(locale, "site");
  const title = t("notFound.title");
  return {
    title: absolute ? { absolute: `${title} | Casa Gad` } : title,
    robots: { index: false, follow: false },
  };
}

export async function NotFoundContent({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");

  return (
    <Container className="pt-16 pb-24">
      <p className="text-eyebrow font-medium tracking-eyebrow text-pietra uppercase">
        {t("notFound.eyebrow")}
      </p>
      <h1 className="mt-3">{t("notFound.h1")}</h1>
      <p className="mt-4 max-w-xl text-lead">{t("notFound.lead")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={routes.home[locale]} className={primaryLink}>
          {t("notFound.home")}
        </a>
        <a href={routes.book[locale]} className={secondaryLink}>
          {t("notFound.dates")}
        </a>
      </div>
    </Container>
  );
}
