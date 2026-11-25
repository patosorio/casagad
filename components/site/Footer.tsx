import Link from "next/link";
import { navLabel } from "@/components/site/nav-label";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import { footerNav, routes } from "@/lib/i18n/routes";
import { getT } from "@/lib/i18n/server";

const footerLink = "inline-flex min-h-tap items-center text-body text-inchiostro no-underline";

export async function Footer({ locale, cin }: { locale: Locale; cin?: string }) {
  const t = await getT(locale, "common");
  const site = await getT(locale, "site");
  const cinText = cin?.trim() ?? "";

  return (
    <footer className="bg-calce py-12 text-body text-pietra-calce">
      <Container>
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="mb-3 flex flex-col text-inchiostro">
              <span className="font-display text-[28px] leading-none font-light">{t("brand.name")}</span>
              <span className="mt-1.5 text-[11px] font-normal tracking-[0.34em] text-pietra-calce uppercase">
                {t("brand.place")}
              </span>
            </p>
            <p>{t("footer.place")}</p>
          </div>
          <div>
            <p className="text-eyebrow font-medium tracking-eyebrow text-pietra-calce uppercase">
              {t("footer.site")}
            </p>
            <ul className="mt-2 list-none p-0">
              {footerNav.map((key) => (
                <li key={key}>
                  <Link href={routes[key][locale]} className={footerLink}>
                    {navLabel(site, key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-eyebrow font-medium tracking-eyebrow text-pietra-calce uppercase">
              {t("footer.legal")}
            </p>
            <ul className="mt-2 list-none p-0">
              <li>
                <Link href={routes.privacy[locale]} className={footerLink}>
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href={routes.cookies[locale]} className={footerLink}>
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
            {cinText ? <p className="mt-3">{t("footer.cin", { cin: cinText })}</p> : null}
          </div>
        </div>
        <p className="mt-8">{t("footer.copyright")}</p>
      </Container>
    </footer>
  );
}
