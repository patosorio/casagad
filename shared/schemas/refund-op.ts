import { z } from "zod";
import { centsSchema } from "./common";

export const refundOpStatuses = ["requested", "succeeded", "failed"] as const;

export const refundOpSchema = z.strictObject({
  amountCents: centsSchema,
  status: z.enum(refundOpStatuses),
  stripeRefundId: z.string().min(1).max(200).optional(),
  actorUid: z.string().min(1).max(128),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RefundOp = z.infer<typeof refundOpSchema>;
