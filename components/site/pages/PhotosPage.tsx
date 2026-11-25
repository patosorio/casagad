import { Gallery, type GalleryGroup } from "@/components/site/Gallery";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHeading } from "@/components/site/Section";
import { photoAlt } from "@/components/site/photo-alt";
import type { Locale } from "@/lib/i18n/config";
import { galleryGroups, photoModel, type GalleryGroupId, type ImageId } from "@/lib/content/photos";
import { routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";
import { breadcrumbLd, jsonLdGraph } from "@/lib/seo/jsonld";
import type { TFunction } from "i18next";

function groupTitle(t: TFunction<"site">, id: GalleryGroupId): string {
  switch (id) {
    case "outside":
      return t("photos.outside");
    case "inside":
      return t("photos.inside");
    case "beach":
      return t("photos.beach");
  }
}

export async function PhotosPage({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const common = await getT(locale, "common");
  const order: GalleryGroupId[] = ["outside", "inside", "beach"];
  const groups: GalleryGroup[] = order.map((id) => ({
    id,
    title: groupTitle(t, id),
    photos: galleryGroups[id].map((photoId: ImageId) => ({
      photo: photoModel(photoId),
      alt: photoAlt(t, photoId),
    })),
  }));

  return (
    <>
      <JsonLd
        data={jsonLdGraph([
          breadcrumbLd([
            { name: common("brand.name"), path: routes.home[locale] },
            { name: t("pages.photos.h1"), path: routes.photos[locale] },
          ]),
        ])}
      />
      <PageHeading title={t("pages.photos.h1")} />
      <Gallery
        groups={groups}
        labels={{
          close: t("photos.close"),
          previous: t("photos.previous"),
          next: t("photos.next"),
          dialog: t("photos.dialog"),
        }}
      />
    </>
  );
}
