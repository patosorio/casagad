import { z } from "zod";

export const leaseSchema = z.strictObject({
  holder: z.string().min(1).max(200),
  expiresAt: z.date(),
});

export type Lease = z.infer<typeof leaseSchema>;
