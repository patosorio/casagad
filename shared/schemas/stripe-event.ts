import { z } from "zod";

export const stripeEventStatuses = ["processing", "done"] as const;

export const stripeEventSchema = z.strictObject({
  type: z.string().min(1).max(80),
  status: z.enum(stripeEventStatuses),
  receivedAt: z.date(),
  doneAt: z.date().optional(),
});

export type StripeEvent = z.infer<typeof stripeEventSchema>;
