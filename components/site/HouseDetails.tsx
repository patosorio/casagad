import type { Locale } from "@/lib/i18n/config";
import { routes, type RouteKey } from "@/lib/i18n/routes";
import {
  formatDepositPercent,
  localizedText,
} from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import { getT } from "@/lib/i18n/server";
import { FactsList } from "@/components/site/FactsList";
import type { SettingsPublic } from "@/shared/schemas/settings";

export async function HouseDetails({ locale, page }: { locale: Locale; page: RouteKey }) {
  const t = await getT(locale, "site");
  const result = await readPublicSettings();
  const values = result.status === "ok" ? valuesFrom(result.settings, locale) : emptyValues();

  const rows = [
    { label: t("details.address"), value: values.address },
    { label: t("details.price"), value: values.price },
    { label: t("details.deposit"), value: values.deposit },
    { label: t("details.cancellation"), value: values.cancellation },
    { label: t("details.checkInMethod"), value: values.checkInMethod },
    { label: t("details.season"), value: values.season },
  ];

  return (
    <div>
      {result.status === "error" ? (
        <p>
          {t("details.error")}{" "}
          <a href={routes[page][locale]}>{t("details.retry")}</a>
        </p>
      ) : null}
      <FactsList rows={rows} />
    </div>
  );
}

function emptyValues() {
  return {
    address: "",
    price: "",
    deposit: "",
    cancellation: "",
    checkInMethod: "",
    season: "",
  };
}

function valuesFrom(settings: SettingsPublic, locale: Locale) {
  return {
    address: localizedText(settings.houseDetails.address, locale),
    price: "",
    deposit: formatDepositPercent(settings.depositPercent, locale),
    cancellation: localizedText(settings.houseDetails.cancellationPolicy, locale),
    checkInMethod: localizedText(settings.houseDetails.checkInMethod, locale),
    season: localizedText(settings.houseDetails.season, locale),
  };
}
