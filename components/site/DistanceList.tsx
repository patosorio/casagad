import type { TFunction } from "i18next";
import { distances, formatKm, type DistanceId } from "@/lib/content/house";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

function distanceName(t: TFunction<"site">, id: DistanceId): string {
  switch (id) {
    case "simius":
      return t("distances.simius.name");
    case "notteri":
      return t("distances.notteri.name");
    case "carbonara":
      return t("distances.carbonara.name");
    case "tanka":
      return t("distances.tanka.name");
    case "giunco":
      return t("distances.giunco.name");
    case "airport":
      return t("distances.airport.name");
  }
}

function distanceTime(t: TFunction<"site">, id: DistanceId): string {
  switch (id) {
    case "simius":
      return t("distances.simius.time");
    case "notteri":
      return t("distances.notteri.time");
    case "carbonara":
      return t("distances.carbonara.time");
    case "tanka":
      return t("distances.tanka.time");
    case "giunco":
      return t("distances.giunco.time");
    case "airport":
      return t("distances.airport.time");
  }
}

export async function DistanceList({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  return (
    <ul className="m-0 list-none p-0">
      {distances.map((item) => (
        <li key={item.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-linea py-3 md:grid-cols-[1fr_auto_auto]">
          <span>{distanceName(t, item.id)}</span>
          <span className="text-pietra">{distanceTime(t, item.id)}</span>
          {item.km === null ? null : (
            <small className="col-span-2 text-small text-pietra md:col-span-1">{formatKm(item.km, locale)}</small>
          )}
        </li>
      ))}
    </ul>
  );
}
