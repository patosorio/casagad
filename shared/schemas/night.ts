import { z } from "zod";

/** Document id is the stay date. The date is not repeated in the body. */
export const nightKinds = ["hold", "booking", "block", "vrbo"] as const;

export const nightSchema = z.strictObject({
  kind: z.enum(nightKinds),
  refId: z.string().min(1).max(128),
  generation: z.number().int().nonnegative(),
  holdExpiresAt: z.date().optional(),
  createdAt: z.date(),
});

export type Night = z.infer<typeof nightSchema>;
