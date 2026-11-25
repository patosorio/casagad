import { JsonLd } from "@/components/site/JsonLd";
import { Container } from "@/components/site/Container";
import { localizedText } from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, faqLd, jsonLdGraph } from "@/lib/seo/jsonld";
import type { TFunction } from "i18next";

const staticFaq = ["times", "pets", "parking", "wifi", "children", "smoking", "deposit"] as const;

function question(t: TFunction<"site">, id: (typeof staticFaq)[number]): string {
  switch (id) {
    case "times":
      return t("info.times.q");
    case "pets":
      return t("info.pets.q");
    case "parking":
      return t("info.parking.q");
    case "wifi":
      return t("info.wifi.q");
    case "children":
      return t("info.children.q");
    case "smoking":
      return t("info.smoking.q");
    case "deposit":
      return t("info.deposit.q");
  }
}

function answer(t: TFunction<"site">, id: (typeof staticFaq)[number]): string {
  switch (id) {
    case "times":
      return t("info.times.a");
    case "pets":
      return t("info.pets.a");
    case "parking":
      return t("info.parking.a");
    case "wifi":
      return t("info.wifi.a");
    case "children":
      return t("info.children.a");
    case "smoking":
      return t("info.smoking.a");
    case "deposit":
      return t("info.deposit.a");
  }
}

export async function InfoPage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const settings = await readPublicSettings();
  const method =
    settings.status === "ok" ? localizedText(settings.settings.houseDetails.checkInMethod, locale) : "";

  const items = staticFaq.map((id) => ({ question: question(t, id), answer: answer(t, id) }));
  if (method) items.push({ question: t("info.checkInMethod.q"), answer: method });

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t("pages.info.h1"), path: routes.info[locale] },
          ]),
          faqLd(items),
        ])}
      />
      <Container className="pt-10 pb-16">
        <div className="narrow">
          <h1>{t("pages.info.h1")}</h1>
          <h2 id="info-faq" className="mt-8">
            {t("info.faqTitle")}
          </h2>
          <div>
            {items.map((item) => (
              <details key={item.question} className="border-b border-linea">
                <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-medium">
                  {item.question}
                </summary>
                <div className="pb-4">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
            {settings.status === "error" ? (
              <details className="border-b border-linea">
                <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-medium">
                  {t("info.checkInMethod.q")}
                </summary>
                <div className="pb-4">
                  <p>
                    {t("details.error")} <a href={routes.info[locale]}>{t("details.retry")}</a>
                  </p>
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}
