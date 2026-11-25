import type { Locale } from "@/lib/i18n/config";
import { formatCheckedDate, formatRatingScore, reviewQuotes, vrboRating } from "@/lib/content/house";
import { getT } from "@/lib/i18n/server";
import { Section } from "@/components/site/Section";

export async function ReviewsBlock({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");
  const quotes = reviewQuotes;

  return (
    <Section titleId="reviews-title" tone="soft">
        <h2 id="reviews-title">{t("reviews.title")}</h2>
        <p className="m-0 font-display text-[56px] leading-none font-light">{formatRatingScore(locale)}</p>
        <p>
          {t("reviews.onSource", { count: vrboRating.count })}{" "}
          <a href={vrboRating.url}>{t("reviews.source")}</a>
          {" · "}
          {t("reviews.checked", { date: formatCheckedDate(locale) })}
        </p>
        {quotes.length > 0 ? (
          <div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {quotes.map((quote) => (
              <blockquote key={`${quote.guest}-${quote.when}`} className="m-0 border-l border-linea pl-5">
                <p>“{quote.text}”</p>
                <footer className="text-small text-pietra">
                  {quote.guest}, {quote.when} · {t("reviews.source")}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : null}
    </Section>
  );
}
