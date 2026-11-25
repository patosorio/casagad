import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { I18nClientProvider } from "@/lib/i18n/client-provider";
import { footerCin, localizedText } from "@/lib/content/house";
import { readPublicSettings } from "@/lib/content/public-settings";
import { shellNamespaces, type Locale } from "@/lib/i18n/config";
import { bundleResources, getT } from "@/lib/i18n/server";

export async function PublicChrome({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = await getT(locale, "common");
  const namespaces = [...shellNamespaces];
  const settings = await readPublicSettings();
  const live = settings.status === "ok" ? settings.settings : undefined;
  const cin = footerCin(live?.cin ?? "");
  const address = live ? localizedText(live.houseDetails.address, locale) : "";

  return (
    <>
      <a
        href="#main"
        className="absolute top-0 left-[-999px] z-50 bg-inchiostro px-4 py-3 text-bianco no-underline focus:top-2 focus:left-2"
      >
        {t("skip")}
      </a>
      <I18nClientProvider
        key={locale}
        locale={locale}
        namespaces={namespaces}
        resources={bundleResources(namespaces)}
      >
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} cin={cin} address={address} />
      </I18nClientProvider>
    </>
  );
}
