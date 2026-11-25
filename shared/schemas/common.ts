import { z } from "zod";

export const localeSchema = z.enum(["it", "en"]);
export type Locale = z.infer<typeof localeSchema>;

/** Stay date `YYYY-MM-DD` in Europe/Rome. */
export const dateStrSchema = z.iso.date();
export type DateStr = z.infer<typeof dateStrSchema>;

/** Italian is required. English is optional and falls back to Italian in the UI. */
export const l10nSchema = z.strictObject({
  it: z.string(),
  en: z.string().optional(),
});
export type L10n = z.infer<typeof l10nSchema>;

export const centsSchema = z.number().int().nonnegative();

export const partySchema = z.strictObject({
  adults: z.number().int().min(1).max(99),
  children: z.number().int().min(0).max(99),
  pets: z.number().int().min(0).max(20),
});
export type Party = z.infer<typeof partySchema>;

export const bookingRefSchema = z.string().regex(/^CG-\d{4}-\d{4}$/);

/** `from` inclusive, `to` exclusive. Both are `YYYY-MM-DD`, so string order is calendar order. */
export function isExclusiveRange(from: string, to: string): boolean {
  return from < to;
}
