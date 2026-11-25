import {
  createInstance,
  type Resource,
  type ResourceKey,
  type ResourceLanguage,
  type TFunction,
  type i18n as I18n,
} from "i18next";
import { i18nInitOptions, type Locale, type Namespace } from "@/lib/i18n/config";
import adminIt from "@/locales/it/admin.json";
import bookingIt from "@/locales/it/booking.json";
import commonIt from "@/locales/it/common.json";
import errorsIt from "@/locales/it/errors.json";
import siteIt from "@/locales/it/site.json";
import bookingEn from "@/locales/en/booking.json";
import commonEn from "@/locales/en/common.json";
import errorsEn from "@/locales/en/errors.json";
import siteEn from "@/locales/en/site.json";

/**
 * Server Components and metadata only. Do not import this file from a Client
 * Component. Each call builds a new instance; nothing here keeps a shared one.
 */

const italianBundles = {
  common: commonIt,
  site: siteIt,
  booking: bookingIt,
  errors: errorsIt,
  admin: adminIt,
} as const;

const englishBundles = {
  common: commonEn,
  site: siteEn,
  booking: bookingEn,
  errors: errorsEn,
} as const;

function cloneNamespace(value: ResourceKey): ResourceKey {
  return structuredClone(value);
}

/** Fresh JSON copies so one instance cannot mutate the module cache. */
export function bundleResources(namespaces: readonly Namespace[]): Resource {
  const italian: ResourceLanguage = {};
  const english: ResourceLanguage = {};

  for (const ns of namespaces) {
    italian[ns] = cloneNamespace(italianBundles[ns]);

    if (ns === "admin") continue;

    english[ns] = cloneNamespace(englishBundles[ns]);
  }

  return { it: italian, en: english };
}

export async function createI18n(locale: Locale, namespaces: readonly Namespace[]): Promise<I18n> {
  const instance = createInstance();
  await instance.init({
    ...i18nInitOptions(locale, namespaces),
    resources: bundleResources(namespaces),
  });
  return instance;
}

export async function getT<Ns extends Namespace>(locale: Locale, ns: Ns): Promise<TFunction<Ns>> {
  const instance = await createI18n(locale, [ns]);
  return instance.getFixedT(locale, ns);
}
