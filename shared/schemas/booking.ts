import { z } from "zod";
import { rangeToNights } from "../dates";
import { bookingRefSchema, dateStrSchema, localeSchema, partySchema } from "./common";
import { quoteSchema } from "./quote";

export const bookingStatuses = [
  "request",
  "accepted",
  "confirmed",
  "paid_in_full",
  "completed",
  "declined",
  "expired",
  "cancelled",
] as const;

export const bookingStatusSchema = z.enum(bookingStatuses);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const bookingSources = ["direct", "vrbo", "manual"] as const;

const guestSchema = z.strictObject({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.email(),
  phone: z.string().min(3).max(40),
  country: z.string().min(2).max(80),
  locale: localeSchema,
});

const consentSchema = z.strictObject({
  privacyVersion: z.string().min(1).max(40),
  acceptedAt: z.date(),
});

export const bookingSchema = z
  .strictObject({
    ref: bookingRefSchema,
    status: bookingStatusSchema,
    source: z.enum(bookingSources),
    checkIn: dateStrSchema,
    checkOut: dateStrSchema,
    nights: z.number().int().min(1).max(730),
    party: partySchema,
    guest: guestSchema,
    guestMessage: z.string().max(2000).optional(),
    quote: quoteSchema,
    depositCents: z.number().int().nonnegative(),
    balanceCents: z.number().int().nonnegative(),
    balanceDueDate: dateStrSchema,
    holdExpiresAt: z.date().optional(),
    holdGeneration: z.number().int().nonnegative(),
    checkoutAttempt: z.number().int().nonnegative(),
    checkoutOpId: z.string().min(1).max(120).optional(),
    checkoutPending: z.boolean(),
    stripeCheckoutSessionId: z.string().min(1).max(200).optional(),
    stripeCheckoutUrl: z.string().min(1).max(500).optional(),
    needsAttention: z.boolean(),
    attentionReason: z.string().min(1).max(200).optional(),
    vrboCheckConfirmedBy: z.string().min(1).max(128).optional(),
    consent: consentSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((booking, ctx) => {
    let stayNights: string[];
    try {
      stayNights = rangeToNights(booking.checkIn, booking.checkOut);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid stay dates", path: ["checkIn"] });
      return;
    }
    if (stayNights.length !== booking.nights) {
      ctx.addIssue({
        code: "custom",
        message: "nights must equal the nights in [checkIn, checkOut)",
        path: ["nights"],
      });
    }
  });

export type Booking = z.infer<typeof bookingSchema>;
