import { ContactForm } from "@/components/site/ContactForm";
import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import { localizedText } from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph } from "@/lib/seo/jsonld";

export async function ContactPage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const settings = await readPublicSettings();
  const address = settings.status === "ok" ? localizedText(settings.settings.houseDetails.address, locale) : "";
  const failed = settings.status === "error";

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t("pages.contact.h1"), path: routes.contact[locale] },
          ]),
        ])}
      />
      <Container className="py-10">
        <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <h1>{t("pages.contact.h1")}</h1>
            <h2>{t("contact.writeTitle")}</h2>
            <ContactForm
              copy={{
                name: t("contact.name"),
                nameHelp: t("contact.nameHelp"),
                email: t("contact.email"),
                emailHelp: t("contact.emailHelp"),
                message: t("contact.message"),
                honeypot: t("contact.honeypot"),
                consentBefore: t("contact.consentBefore"),
                consentLink: t("contact.consentLink"),
                consentAfter: t("contact.consentAfter"),
                submit: t("contact.submit"),
                note: t("contact.note"),
                privacyHref: routes.privacy[locale],
              }}
            />
          </div>
          <div>
            <h2>{t("contact.addressTitle")}</h2>
            {failed ? (
              <p>
                {t("details.error")} <a href={routes.contact[locale]}>{t("details.retry")}</a>
              </p>
            ) : null}
            {address ? <p>{address}</p> : null}
            <p>{t("contact.place")}</p>
          </div>
        </div>
      </Container>
    </>
  );
}
