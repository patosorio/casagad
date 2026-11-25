import { BookingStub } from "@/components/booking/BookingStub";
import { HouseDetails } from "@/components/site/HouseDetails";
import { JsonLd } from "@/components/site/JsonLd";
import { Container } from "@/components/site/Container";
import { Section } from "@/components/site/Section";
import { footerCin } from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph } from "@/lib/seo/jsonld";

export async function BookPage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const settings = await readPublicSettings();
  const cin = footerCin(settings.status === "ok" ? settings.settings.cin : "");

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t("pages.book.h1"), path: routes.book[locale] },
          ]),
        ])}
      />
      <Container className="pt-10">
        <ol aria-label={t("book.stepsLabel")} className="m-0 mb-7 flex list-none flex-wrap gap-1.5 p-0 text-[13px]">
          <li aria-current="step" className="font-medium text-inchiostro">
            {t("book.stepDates")}
          </li>
          <li className="text-pietra">{t("book.stepRequest")}</li>
          <li className="text-pietra">{t("book.stepReply")}</li>
          <li className="text-pietra">{t("book.stepDeposit")}</li>
        </ol>
        <h1>{t("pages.book.h1")}</h1>
      </Container>
      <Section titleId="book-calendar" compact>
        <BookingStub locale={locale} />
      </Section>
      <Section titleId="book-how" tone="soft">
        <div className="grid gap-7 lg:grid-cols-3">
          <div>
            <h2 id="book-how">{t("book.howTitle")}</h2>
            <ol className="m-0 list-decimal pl-5">
              <li>{t("book.how1")}</li>
              <li>{t("book.how2")}</li>
              <li>{t("book.how3")}</li>
            </ol>
          </div>
          <div>
            <h2>{t("book.timesTitle")}</h2>
            <ul className="m-0 list-none p-0">
              <li className="flex justify-between gap-4 border-b border-linea py-3">
                <span className="text-pietra">{t("book.checkInLabel")}</span>
                <span>{t("book.checkInValue")}</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-linea py-3">
                <span className="text-pietra">{t("book.checkOutLabel")}</span>
                <span>{t("book.checkOutValue")}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2>{t("book.termsTitle")}</h2>
            <HouseDetails locale={locale} page="book" />
            {cin ? <p className="mt-3 text-small">{common("footer.cin", { cin })}</p> : null}
          </div>
        </div>
      </Section>
    </>
  );
}
