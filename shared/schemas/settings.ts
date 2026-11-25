import { z } from "zod";
import { centsSchema, l10nSchema } from "./common";

export const touristTaxSchema = z.strictObject({
  enabled: z.boolean(),
  perPersonPerNightCents: centsSchema.nullable(),
  maxNights: z.number().int().min(1).max(60).nullable(),
  exemptUnderAge: z.number().int().min(0).max(120).nullable(),
  months: z.array(z.number().int().min(1).max(12)),
  note: l10nSchema,
});
export type TouristTax = z.infer<typeof touristTaxSchema>;

export const houseDetailsSchema = z.strictObject({
  address: l10nSchema,
  checkInMethod: l10nSchema,
  cancellationPolicy: l10nSchema,
  season: l10nSchema,
  notice: l10nSchema,
});
export type HouseDetails = z.infer<typeof houseDetailsSchema>;

export const settingsPublicSchema = z
  .strictObject({
    depositPercent: z.number().int().min(1).max(100),
    balanceDueDaysBeforeArrival: z.number().int().min(0).max(365),
    cleaningFeeCents: centsSchema,
    baseGuests: z.number().int().min(1).max(99),
    maxGuests: z.number().int().min(1).max(99),
    extraGuestFeeCents: centsSchema,
    maxPets: z.number().int().min(0).max(20),
    petFeeCents: centsSchema,
    holdHours: z.number().int().min(1).max(24),
    bookingWindowDays: z.number().int().min(1).max(730),
    touristTax: touristTaxSchema,
    houseDetails: houseDetailsSchema,
    cin: z.string().max(64),
  })
  .superRefine((settings, ctx) => {
    if (settings.maxGuests < settings.baseGuests) {
      ctx.addIssue({
        code: "custom",
        message: "maxGuests must be at least baseGuests",
        path: ["maxGuests"],
      });
    }
  });

export type SettingsPublic = z.infer<typeof settingsPublicSchema>;

/** Owner notification addresses. `notificationEmails` is the stored field name. */
export const settingsPrivateSchema = z.strictObject({
  vrboSyncEnabled: z.boolean(),
  notificationEmails: z.array(z.email()).max(10),
});

export type SettingsPrivate = z.infer<typeof settingsPrivateSchema>;

export const ratesMetaSchema = z.strictObject({
  version: z.number().int().nonnegative(),
  updatedAt: z.date(),
});

export type RatesMeta = z.infer<typeof ratesMetaSchema>;
