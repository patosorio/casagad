"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "@/lib/i18n/config";
import { alternatePath, hrefWithLocation } from "@/lib/i18n/routes";

const langControl =
  "inline-flex min-h-tap min-w-tap items-center justify-center text-[13px] font-medium tracking-[0.12em]";

function otherLocale(locale: Locale): Locale {
  return locale === "it" ? "en" : "it";
}

function followLiveLocation(event: MouseEvent<HTMLAnchorElement>, locale: Locale) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const url = new URL(window.location.href);
  const next = hrefWithLocation(alternatePath(url.pathname, otherLocale(locale)), url.search, url.hash);
  if (event.currentTarget.href === new URL(next, url.origin).href) return;
  event.preventDefault();
  window.location.assign(next);
}

function LanguageLinks({
  locale,
  search,
  hash,
}: {
  locale: Locale;
  search: string;
  hash: string;
}) {
  const { t } = useTranslation("common");
  const pathname = usePathname() ?? "/";
  const other = otherLocale(locale);
  const href = hrefWithLocation(alternatePath(pathname, other), search, hash);
  const linkClass = `${langControl} text-inchiostro no-underline`;
  const currentClass = `${langControl} text-mare underline underline-offset-4`;

  return (
    <div role="group" aria-label={t("language.label")} className="flex">
      {locale === "it" ? (
        <span lang="it" aria-current="true" className={currentClass}>
          IT
        </span>
      ) : (
        <a
          href={href}
          lang="it"
          hrefLang="it"
          aria-label={t("language.it")}
          onClick={(event) => followLiveLocation(event, locale)}
          className={linkClass}
        >
          IT
        </a>
      )}
      {locale === "en" ? (
        <span lang="en" aria-current="true" className={currentClass}>
          EN
        </span>
      ) : (
        <a
          href={href}
          lang="en"
          hrefLang="en"
          aria-label={t("language.en")}
          onClick={(event) => followLiveLocation(event, locale)}
          className={linkClass}
        >
          EN
        </a>
      )}
    </div>
  );
}

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function currentHash() {
  return window.location.hash;
}

function LanguageSwitchLive({ locale }: { locale: Locale }) {
  const search = useSearchParams().toString();
  const hash = useSyncExternalStore(subscribeToHash, currentHash, () => "");

  return <LanguageLinks locale={locale} search={search} hash={hash} />;
}

export function LanguageSwitch({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<LanguageLinks locale={locale} search="" hash="" />}>
      <LanguageSwitchLive locale={locale} />
    </Suspense>
  );
}
