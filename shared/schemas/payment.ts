import { z } from "zod";
import { centsSchema } from "./common";

export const paymentKinds = ["deposit", "balance", "refund"] as const;
export const paymentMethods = ["stripe", "bank", "cash"] as const;
export const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

export const paymentSchema = z.strictObject({
  kind: z.enum(paymentKinds),
  method: z.enum(paymentMethods),
  amountCents: centsSchema,
  touristTaxCents: centsSchema,
  status: z.enum(paymentStatuses),
  stripePaymentIntentId: z.string().min(1).max(200).optional(),
  livemode: z.boolean(),
  paidAt: z.date().optional(),
  receiptNumber: z.string().min(1).max(40).optional(),
  receiptPath: z.string().min(1).max(200).optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
