import { ButtonLink } from "@/components/ui/Button";
import { GlanceList } from "@/components/site/FactsList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeading, Section } from "@/components/site/Section";
import { Photo } from "@/components/site/Photo";
import { photoAlt } from "@/components/site/photo-alt";
import type { Locale } from "@/lib/i18n/config";
import { photoModel, type ImageId } from "@/lib/content/photos";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph, vacationRentalLd } from "@/lib/seo/jsonld";

export async function HousePage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const graph = jsonLdGraph([
    vacationRentalLd({
      name: "Casa Gad",
      description: t("meta.house.description"),
      path: routes.house[locale],
      images: [photoModel("0761").src, photoModel("0745").src],
      amenities: [
        t("amenities.wifi"),
        t("amenities.ac"),
        t("amenities.parking"),
        t("amenities.linen"),
        t("amenities.barbecue"),
        t("amenities.shower"),
        t("amenities.terrace"),
        t("amenities.garden"),
      ],
    }),
    breadcrumbLd([
      { name: common("brand.name"), path: routes.home[locale] },
      { name: t("pages.house.h1"), path: routes.house[locale] },
    ]),
  ]);

  return (
    <>
      <JsonLd data={graph} />
      <PageHeading eyebrow={t("house.eyebrow")} title={t("pages.house.h1")} lead={t("house.lead")} />
      <HouseBlock
        titleId="house-bedrooms"
        title={t("house.bedroomsTitle")}
        body={t("house.bedroomsBody")}
        photos={["0761", "0765", "0768"] as const}
        alts={(id) => photoAlt(t, id)}
      />
      <HouseBlock
        titleId="house-kitchen"
        title={t("house.kitchenTitle")}
        body={t("house.kitchenBody")}
        photos={["0756", "0769"] as const}
        alts={(id) => photoAlt(t, id)}
      />
      <HouseBlock
        titleId="house-baths"
        title={t("house.bathsTitle")}
        body={t("house.bathsBody")}
        photos={["0763"] as const}
        alts={(id) => photoAlt(t, id)}
      />
      <HouseBlock
        titleId="house-terrace"
        title={t("house.terraceTitle")}
        body={t("house.terraceBody")}
        photos={["0745", "0754"] as const}
        alts={(id) => photoAlt(t, id)}
      />
      <HouseBlock
        titleId="house-garden"
        title={t("house.gardenTitle")}
        body={t("house.gardenBody")}
        photos={["0760", "0772"] as const}
        alts={(id) => photoAlt(t, id)}
      />
      <Section titleId="house-included" tone="soft">
        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <h2 id="house-included">{t("house.includedTitle")}</h2>
            <ul className="m-0 list-none p-0">
              {[
                t("house.included.linen"),
                t("house.included.umbrellas"),
                t("house.included.wifi"),
                t("house.included.ac"),
                t("house.included.parking"),
              ].map((item) => (
                <li key={item} className="border-b border-linea py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{t("house.rulesTitle")}</h2>
            <GlanceList
              items={[
                t("glance.checkIn"),
                t("glance.checkOut"),
                t("glance.pet"),
                t("glance.parking"),
                t("glance.smoking"),
                t("glance.parties"),
                t("glance.children"),
              ]}
            />
            <div className="mt-6">
              <ButtonLink href={routes.book[locale]}>{t("house.checkDates")}</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function HouseBlock({
  titleId,
  title,
  body,
  photos,
  alts,
}: {
  titleId: string;
  title: string;
  body: string;
  photos: readonly ImageId[];
  alts: (id: ImageId) => string;
}) {
  return (
    <Section titleId={titleId}>
      <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div className="grid gap-7 md:grid-cols-2">
          {photos.map((id) => (
            <Photo
              key={id}
              photo={photoModel(id)}
              alt={alts(id)}
              sizes="(min-width: 768px) 30vw, 100vw"
              className="aspect-[3/2] w-full object-cover"
            />
          ))}
        </div>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>{body}</p>
        </div>
      </div>
    </Section>
  );
}
