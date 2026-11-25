import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/site/Card";
import { DistanceList } from "@/components/site/DistanceList";
import { GlanceList } from "@/components/site/FactsList";
import { Hero } from "@/components/site/Hero";
import { HouseDetails } from "@/components/site/HouseDetails";
import { JsonLd } from "@/components/site/JsonLd";
import { Photo } from "@/components/site/Photo";
import { ReviewsBlock } from "@/components/site/ReviewsBlock";
import { Section } from "@/components/site/Section";
import { photoAlt } from "@/components/site/photo-alt";
import type { Locale } from "@/lib/i18n/config";
import { photoModel } from "@/lib/content/photos";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph, vacationRentalLd } from "@/lib/seo/jsonld";

export async function HomePage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const description = t("meta.home.description");
  const graph = jsonLdGraph([
    vacationRentalLd({
      name: "Casa Gad",
      description,
      path: routes.home[locale],
      images: [photoModel("0745").src, photoModel("0748").src],
      amenities: [
        t("amenities.wifi"),
        t("amenities.ac"),
        t("amenities.parking"),
        t("amenities.linen"),
        t("amenities.umbrellas"),
        t("amenities.barbecue"),
        t("amenities.shower"),
        t("amenities.terrace"),
        t("amenities.garden"),
      ],
    }),
    breadcrumbLd([{ name: t("pages.home.h1"), path: routes.home[locale] }]),
  ]);

  return (
    <>
      <JsonLd data={graph} />
      <Hero
        eyebrow={t("home.eyebrow")}
        title={t("pages.home.h1")}
        lead={t("home.lead")}
        mobile={photoModel("0748")}
        desktop={photoModel("0745")}
        alt={photoAlt(t, "0745")}
        actions={
          <>
            <ButtonLink href={routes.book[locale]}>{t("home.checkDates")}</ButtonLink>
            <ButtonLink href={routes.house[locale]} variant="secondary">
              {t("home.seeHouse")}
            </ButtonLink>
          </>
        }
      />
      <Section titleId="home-house">
        <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <p className="mb-3.5 font-body text-eyebrow font-medium tracking-eyebrow text-pietra uppercase">
              {t("home.houseEyebrow")}
            </p>
            <h2 id="home-house">{t("home.houseTitle")}</h2>
            <p>{t("home.houseBody")}</p>
            <Link href={routes.house[locale]}>{t("home.houseLink")}</Link>
          </div>
          <Photo
            photo={photoModel("0769")}
            alt={photoAlt(t, "0769")}
            sizes="(min-width: 1024px) 420px, 100vw"
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          <Card
            photo={photoModel("0761")}
            alt={photoAlt(t, "0761")}
            eyebrow={t("home.cards.bedroom.eyebrow")}
            title={t("home.cards.bedroom.title")}
            facts={t("home.cards.bedroom.facts")}
          >
            <Link href={routes.house[locale]}>{t("home.cards.bedroom.link")}</Link>
          </Card>
          <Card
            photo={photoModel("0756")}
            alt={photoAlt(t, "0756")}
            eyebrow={t("home.cards.kitchen.eyebrow")}
            title={t("home.cards.kitchen.title")}
          >
            <Link href={routes.house[locale]}>{t("home.cards.kitchen.link")}</Link>
          </Card>
          <Card
            photo={photoModel("0754")}
            alt={photoAlt(t, "0754")}
            eyebrow={t("home.cards.outdoor.eyebrow")}
            title={t("home.cards.outdoor.title")}
            facts={t("home.cards.outdoor.facts")}
          >
            <Link href={routes.photos[locale]}>{t("home.cards.outdoor.link")}</Link>
          </Card>
        </div>
      </Section>
      <Section titleId="home-sea" tone="soft">
        <div className="grid items-center gap-7 md:grid-cols-2">
          <Photo
            photo={photoModel("0749")}
            alt={photoAlt(t, "0749")}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[3/2] w-full object-cover"
          />
          <div>
            <h2 id="home-sea">{t("home.seaTitle")}</h2>
            <p className="font-body text-lead font-light">{t("home.seaBody")}</p>
          </div>
        </div>
      </Section>
      <Section titleId="home-outside">
        <h2 id="home-outside">{t("home.outsideTitle")}</h2>
        <p className="narrow font-body text-lead font-light">{t("home.outsideLead")}</p>
        <div className="mt-7 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          {(["0745", "0760", "0772"] as const).map((id) => (
            <Photo
              key={id}
              photo={photoModel(id)}
              alt={photoAlt(t, id)}
              sizes="(min-width: 768px) 33vw, 50vw"
              className="aspect-[3/2] w-full object-cover"
            />
          ))}
        </div>
      </Section>
      <Section titleId="home-where">
        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <h2 id="home-where">{t("home.whereTitle")}</h2>
            <p>{t("home.whereBody")}</p>
            <Link href={routes.location[locale]}>{t("home.whereLink")}</Link>
          </div>
          <DistanceList locale={locale} />
        </div>
      </Section>
      <ReviewsBlock locale={locale} />
      <Section titleId="home-dates">
        <div className="grid gap-7 md:grid-cols-2">
          <div>
            <h2 id="home-dates">{t("home.datesTitle")}</h2>
            <p className="font-body text-lead font-light">{t("home.datesLead")}</p>
            <ButtonLink href={routes.book[locale]} variant="secondary">
              {t("home.datesLink")}
            </ButtonLink>
            <h3 className="mt-9">{t("home.glanceTitle")}</h3>
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
          </div>
          <HouseDetails locale={locale} page="home" />
        </div>
      </Section>
    </>
  );
}
