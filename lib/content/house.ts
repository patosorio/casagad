import { intlLocaleFor, type Locale } from "@/lib/i18n/config";
import type { L10n } from "@/shared/schemas/common";

/**
 * Confirmed house facts only. CIN stays empty until the accountant confirms it.
 * Review quotes stay empty until real VRBO sentences are added here.
 * The G4 slots marked for Patricia are not rendered.
 */
export const confirmedCin = "";

export const vrboRating = {
  score: 9.8,
  count: 77,
  checkedOn: "2026-11-05",
  url: "https://www.vrbo.com/6306300ha",
} as const;

export type ReviewQuote = {
  text: string;
  guest: string;
  when: string;
};

export const reviewQuotes: readonly ReviewQuote[] = [];

export const stayTimes = {
  checkIn: "16:30",
  checkOut: "10:00",
} as const;

export const bedrooms = 3;
export const maxGuests = 8;

/** Place search when no street address is stored. Not a guessed street. */
export const mapsPlaceQuery = "Simius, Villasimius, Sardegna";

export const distances = [
  { id: "simius", km: 0.1 },
  { id: "notteri", km: 1.3 },
  { id: "carbonara", km: 1.6 },
  { id: "tanka", km: 1.5 },
  { id: "giunco", km: 4.4 },
  { id: "airport", km: null },
] as const;

export type DistanceId = (typeof distances)[number]["id"];

export const restaurants = ["tartana", "acqua", "lobby", "delfino", "gnocco"] as const;

export type RestaurantId = (typeof restaurants)[number];

export function localizedText(value: L10n, locale: Locale): string {
  if (locale === "it") return value.it.trim();
  const english = value.en?.trim() ?? "";
  return english || value.it.trim();
}

/** Settings win when they carry a CIN. Otherwise the confirmed baked value, which is empty. */
export function footerCin(live: string | null | undefined): string {
  const fromSettings = live?.trim() ?? "";
  if (fromSettings) return fromSettings;
  return confirmedCin.trim();
}

export function mapsUrl(address: string): string {
  const query = address.trim() || mapsPlaceQuery;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatKm(km: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(intlLocaleFor(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km);
  return `${formatted} km`;
}

export function formatRatingScore(locale: Locale): string {
  const formatted = new Intl.NumberFormat(intlLocaleFor(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(vrboRating.score);
  return `${formatted}/10`;
}

export function formatCheckedDate(locale: Locale): string {
  const [year, month, day] = vrboRating.checkedOn.split("-").map((part) => Number(part));
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat(intlLocaleFor(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(date);
}

export function formatDepositPercent(percent: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocaleFor(locale), {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percent / 100);
}
