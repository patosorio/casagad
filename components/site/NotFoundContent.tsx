import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/site/Container";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";

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
        <ButtonLink href={routes.home[locale]}>{t("notFound.home")}</ButtonLink>
        <ButtonLink href={routes.book[locale]} variant="secondary">
          {t("notFound.dates")}
        </ButtonLink>
      </div>
    </Container>
  );
}
