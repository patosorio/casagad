import type { TFunction } from "i18next";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

const dow = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Layout only. Dates and prices are not loaded yet, and no sample figures are shown. */
export async function BookingStub({ locale }: { locale: Locale }) {
  const t = await getT(locale, "site");

  return (
    <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
      <div>
        <h2 id="book-calendar" className="sr-only">
          {t("book.calendarTitle")}
        </h2>
        <div className="border border-linea bg-bianco p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              disabled
              aria-label={t("book.previousMonth")}
              className="inline-flex h-tap w-tap items-center justify-center rounded-full border border-linea bg-bianco text-inchiostro disabled:text-pietra"
            >
              ‹
            </button>
            <span className="font-display text-h3 font-normal" />
            <button
              type="button"
              disabled
              aria-label={t("book.nextMonth")}
              className="inline-flex h-tap w-tap items-center justify-center rounded-full border border-linea bg-bianco text-inchiostro disabled:text-pietra"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 text-center" role="group" aria-label={t("book.chooseDates")}>
            {dow.map((day) => (
              <span key={day} aria-hidden="true" className="py-2 text-[11px] font-medium tracking-[0.1em] text-pietra uppercase">
                {dowLabel(t, day)}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3.5 text-[13px] text-pietra">
            <span>{t("book.legendFree")}</span>
            <span>{t("book.legendBusy")}</span>
            <span>{t("book.legendChosen")}</span>
          </div>
        </div>
        <div className="mt-5 grid gap-0 md:grid-cols-2 md:gap-x-4">
          <div className="mb-5 flex flex-col gap-2">
            <span className="font-body text-eyebrow font-medium tracking-[0.14em] uppercase">{t("book.arrival")}</span>
            <output>—</output>
            <span className="text-small text-pietra">{t("book.checkInHelp")}</span>
          </div>
          <div className="mb-5 flex flex-col gap-2">
            <span className="font-body text-eyebrow font-medium tracking-[0.14em] uppercase">{t("book.departure")}</span>
            <output>—</output>
            <span className="text-small text-pietra">{t("book.checkOutHelp")}</span>
          </div>
        </div>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 font-body text-eyebrow font-medium tracking-[0.14em] uppercase">{t("book.guests")}</legend>
          <PartyRow label={t("book.adults")} less={t("book.fewerAdults")} more={t("book.moreAdults")} />
          <PartyRow label={t("book.children")} less={t("book.fewerChildren")} more={t("book.moreChildren")} />
          <PartyRow label={t("book.pet")} less={t("book.noPet")} more={t("book.addPet")} />
          <p className="mt-2 text-small text-pietra">{t("book.partyNote")}</p>
        </fieldset>
      </div>
      <aside aria-labelledby="quote-title">
        <div className="border border-linea bg-bianco p-5">
          <h2 id="quote-title" className="text-h2">
            {t("book.quoteTitle")}
          </h2>
          <table className="w-full border-collapse text-[15px]">
            <caption className="sr-only">{t("book.quoteCaption")}</caption>
            <tbody>
              <QuoteRow label={t("book.lines.nights")} />
              <QuoteRow label={t("book.lines.cleaning")} />
              <QuoteRow label={t("book.lines.pet")} />
              <QuoteRow label={t("book.lines.tax")} />
              <QuoteRow label={t("book.lines.total")} />
              <QuoteRow label={t("book.lines.deposit")} />
              <QuoteRow label={t("book.lines.balance")} />
            </tbody>
          </table>
          <Button type="button" disabled className="mt-4 w-full">
            {t("book.continue")}
          </Button>
          <p className="mt-2.5 text-small text-pietra">{t("book.noPay")}</p>
        </div>
      </aside>
    </div>
  );
}

function PartyRow({ label, less, more }: { label: string; less: string; more: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-linea py-2.5">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <button type="button" disabled aria-label={less} className="inline-flex h-tap w-tap items-center justify-center rounded-full border border-field-border bg-bianco text-[22px] text-linea">
          −
        </button>
        <output className="min-w-7 text-center">—</output>
        <button type="button" disabled aria-label={more} className="inline-flex h-tap w-tap items-center justify-center rounded-full border border-field-border bg-bianco text-[22px] text-linea">
          +
        </button>
      </span>
    </div>
  );
}

function QuoteRow({ label }: { label: string }) {
  return (
    <tr className="border-b border-linea">
      <td className="py-3 pr-3">{label}</td>
      <td className="py-3 text-right" />
    </tr>
  );
}

function dowLabel(t: TFunction<"site">, day: (typeof dow)[number]): string {
  switch (day) {
    case "mon":
      return t("book.dow.mon");
    case "tue":
      return t("book.dow.tue");
    case "wed":
      return t("book.dow.wed");
    case "thu":
      return t("book.dow.thu");
    case "fri":
      return t("book.dow.fri");
    case "sat":
      return t("book.dow.sat");
    case "sun":
      return t("book.dow.sun");
  }
}
