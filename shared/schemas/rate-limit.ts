import { z } from "zod";

export const rateLimitSchema = z.strictObject({
  count: z.number().int().nonnegative(),
  windowStartedAt: z.date(),
});

export type RateLimit = z.infer<typeof rateLimitSchema>;
