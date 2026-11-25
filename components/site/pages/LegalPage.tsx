import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import type { Locale } from "@/lib/i18n/config";
import { routes, type RouteKey } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph } from "@/lib/seo/jsonld";
import type { TFunction } from "i18next";

const privacyKeys = [
  "controller",
  "data",
  "basis",
  "payments",
  "guests",
  "retention",
  "recipients",
  "transfers",
  "rights",
  "complaints",
] as const;

const cookieKeys = ["what", "technical", "none", "recaptcha", "manage"] as const;

function privacyHeading(t: TFunction<"site">, key: (typeof privacyKeys)[number]): string {
  switch (key) {
    case "controller":
      return t("legal.privacy.controller");
    case "data":
      return t("legal.privacy.data");
    case "basis":
      return t("legal.privacy.basis");
    case "payments":
      return t("legal.privacy.payments");
    case "guests":
      return t("legal.privacy.guests");
    case "retention":
      return t("legal.privacy.retention");
    case "recipients":
      return t("legal.privacy.recipients");
    case "transfers":
      return t("legal.privacy.transfers");
    case "rights":
      return t("legal.privacy.rights");
    case "complaints":
      return t("legal.privacy.complaints");
  }
}

function cookieHeading(t: TFunction<"site">, key: (typeof cookieKeys)[number]): string {
  switch (key) {
    case "what":
      return t("legal.cookies.what");
    case "technical":
      return t("legal.cookies.technical");
    case "none":
      return t("legal.cookies.none");
    case "recaptcha":
      return t("legal.cookies.recaptcha");
    case "manage":
      return t("legal.cookies.manage");
  }
}

export async function LegalPage({ locale, page }: { locale: Locale; page: Extract<RouteKey, "privacy" | "cookies"> }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const headings =
    page === "privacy" ? privacyKeys.map((key) => privacyHeading(t, key)) : cookieKeys.map((key) => cookieHeading(t, key));

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t(page === "privacy" ? "pages.privacy.h1" : "pages.cookies.h1"), path: routes[page][locale] },
          ]),
        ])}
      />
      <Container className="pt-10 pb-16">
        <div className="narrow">
          <h1>{t(page === "privacy" ? "pages.privacy.h1" : "pages.cookies.h1")}</h1>
          {headings.map((heading) => (
            <h2 key={heading} className="mt-8">
              {heading}
            </h2>
          ))}
        </div>
      </Container>
    </>
  );
}
