import { z } from "zod";
import { centsSchema, l10nSchema } from "./common";

export const quoteLineKinds = ["nights", "cleaning", "extraGuests", "pets", "touristTax"] as const;

export const quoteLineSchema = z.strictObject({
  kind: z.enum(quoteLineKinds),
  label: l10nSchema,
  qty: z.number().int().min(1),
  unitCents: centsSchema,
  totalCents: centsSchema,
  seasonId: z.string().min(1).optional(),
});
export type QuoteLine = z.infer<typeof quoteLineSchema>;

/**
 * Frozen price snapshot.
 * `ratesVersion` is the integer `settings/ratesMeta.version` (TR-04).
 */
export const quoteSchema = z.strictObject({
  lines: z.array(quoteLineSchema),
  subtotalCents: centsSchema,
  touristTaxCents: centsSchema,
  totalCents: centsSchema,
  depositCents: centsSchema,
  balanceCents: centsSchema,
  currency: z.literal("EUR"),
  ratesVersion: z.number().int().nonnegative(),
});
export type Quote = z.infer<typeof quoteSchema>;
