import { z } from "zod";

export const counterSchema = z.strictObject({
  // value = last issued number; missing doc = 0.
  value: z.number().int().nonnegative(),
});

export type Counter = z.infer<typeof counterSchema>;
