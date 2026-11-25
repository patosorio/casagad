import { Photo } from "@/components/site/Photo";
import type { PhotoModel } from "@/lib/content/photos";
import { mapsUrl, localizedText } from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import type { Locale } from "@/lib/i18n/config";
import { routes, type RouteKey } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";

export async function StaticMap({
  locale,
  page,
  photo,
  alt,
}: {
  locale: Locale;
  page: RouteKey;
  photo: PhotoModel;
  alt: string;
}) {
  const t = await getT(locale, "site");
  const result = await readPublicSettings();
  const address = result.status === "ok" ? localizedText(result.settings.houseDetails.address, locale) : "";

  return (
    <div className="grid gap-7 md:grid-cols-2 md:items-center">
      <figure className="m-0">
        <Photo photo={photo} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[3/2] w-full object-cover" />
      </figure>
      <div>
        <h2 id="location-beach">{t("location.beachTitle")}</h2>
        <p>{t("location.beachBody")}</p>
        {result.status === "error" ? (
          <p>
            {t("details.error")}{" "}
            <a href={routes[page][locale]}>{t("details.retry")}</a>
          </p>
        ) : null}
        {address ? (
          <p>
            {t("details.address")}: {address}
          </p>
        ) : null}
        <p>
          <a href={mapsUrl(address)} rel="noopener noreferrer">
            {t("location.maps")}
          </a>{" "}
          <span className="text-small text-pietra">{t("location.mapsNote")}</span>
        </p>
      </div>
    </div>
  );
}
