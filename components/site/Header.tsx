"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitch } from "@/components/site/LanguageSwitch";
import { navLabel } from "@/components/site/nav-label";
import { Container } from "@/components/site/Container";
import type { Locale } from "@/lib/i18n/config";
import { primaryNav, routeKeyFromPath, routes } from "@/lib/i18n/routes";

export function Header({ locale }: { locale: Locale }) {
  const { t } = useTranslation("site");
  const { t: tCommon } = useTranslation("common");
  const pathname = usePathname() ?? "/";
  const current = routeKeyFromPath(pathname);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  const items = primaryNav.map((key) => ({
    key,
    href: routes[key][locale],
    label: navLabel(t, key),
    current: current === key,
  }));

  return (
    <header className="relative z-10 border-b border-linea bg-bianco">
      <Container className="flex min-h-[72px] items-center justify-between gap-4">
        <Link
          href={routes.home[locale]}
          aria-label={t("homeLabel")}
          className="flex flex-col text-inchiostro no-underline"
        >
          <span className="font-display text-[28px] leading-none font-light">{tCommon("brand.name")}</span>
          <span className="mt-1.5 text-[11px] font-normal tracking-[0.34em] text-pietra uppercase">
            {tCommon("brand.place")}
          </span>
        </Link>
        <nav aria-label={t("nav.label")} className="hidden lg:block">
          <ul className="flex list-none gap-6 p-0">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`inline-flex min-h-tap items-center text-body text-inchiostro no-underline ${item.current ? "border-b border-inchiostro" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center">
          <LanguageSwitch locale={locale} />
          <button
            type="button"
            className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-brand border border-linea bg-bianco px-3 font-body text-[13px] font-medium tracking-[0.1em] text-inchiostro lg:hidden"
            aria-expanded={open}
            aria-controls="mnav"
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            {open ? tCommon("menu.close") : tCommon("menu.open")}
          </button>
        </div>
      </Container>
      <nav
        id="mnav"
        aria-label={t("nav.mobileLabel")}
        hidden={!open}
        className="border-t border-linea lg:hidden"
      >
        <Container as="ul" className="list-none py-2">
          {items.map((item) => (
            <li key={item.key} className="border-b border-linea">
              <Link
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className="flex min-h-tap items-center text-[18px] text-inchiostro no-underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </Container>
      </nav>
    </header>
  );
}
