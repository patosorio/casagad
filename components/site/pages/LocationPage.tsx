import { DistanceList } from "@/components/site/DistanceList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeading, Section } from "@/components/site/Section";
import { StaticMap } from "@/components/site/StaticMap";
import { photoAlt } from "@/components/site/photo-alt";
import { photoModel } from "@/lib/content/photos";
import { restaurants, type RestaurantId } from "@/lib/content/house";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph } from "@/lib/seo/jsonld";
import type { TFunction } from "i18next";

function restaurantName(t: TFunction<"site">, id: RestaurantId): string {
  switch (id) {
    case "tartana":
      return t("restaurants.tartana.name");
    case "acqua":
      return t("restaurants.acqua.name");
    case "lobby":
      return t("restaurants.lobby.name");
    case "delfino":
      return t("restaurants.delfino.name");
    case "gnocco":
      return t("restaurants.gnocco.name");
  }
}

function restaurantTime(t: TFunction<"site">, id: RestaurantId): string {
  switch (id) {
    case "tartana":
      return t("restaurants.tartana.time");
    case "acqua":
      return t("restaurants.acqua.time");
    case "lobby":
      return t("restaurants.lobby.time");
    case "delfino":
      return t("restaurants.delfino.time");
    case "gnocco":
      return t("restaurants.gnocco.time");
  }
}

export async function LocationPage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t("pages.location.h1"), path: routes.location[locale] },
          ]),
        ])}
      />
      <PageHeading title={t("pages.location.h1")} />
      <Section titleId="location-beach">
        <StaticMap locale={locale} page="location" photo={photoModel("0749")} alt={photoAlt(t, "0749")} />
      </Section>
      <Section titleId="location-nearby" tone="soft">
        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <h2 id="location-nearby">{t("location.nearbyTitle")}</h2>
            <p>{t("location.nearbyBody")}</p>
          </div>
          <DistanceList locale={locale} />
        </div>
      </Section>
      <Section titleId="location-carbonara">
        <div className="narrow">
          <h2 id="location-carbonara">{t("location.carbonaraTitle")}</h2>
          <p>{t("location.carbonaraBody")}</p>
        </div>
      </Section>
      <Section titleId="location-airport">
        <div className="narrow">
          <h2 id="location-airport">{t("location.airportTitle")}</h2>
          <p>{t("location.airportBody")}</p>
        </div>
      </Section>
      <Section titleId="location-restaurants" tone="soft">
        <h2 id="location-restaurants">{t("location.restaurantsTitle")}</h2>
        <ul className="m-0 list-none p-0">
          {restaurants.map((id) => (
            <li key={id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-linea py-3">
              <span>{restaurantName(t, id)}</span>
              <span className="text-pietra">{restaurantTime(t, id)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
