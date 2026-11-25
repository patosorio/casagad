import { z } from "zod";

export const syncStatuses = ["ok", "stale", "failing", "suspicious"] as const;

export const syncStateSchema = z.strictObject({
  lastAttemptAt: z.date().optional(),
  lastSuccessAt: z.date().optional(),
  lastEventCount: z.number().int().nonnegative().optional(),
  consecutiveFailures: z.number().int().nonnegative(),
  status: z.enum(syncStatuses),
  lastAlertAt: z.date().optional(),
});

export type SyncState = z.infer<typeof syncStateSchema>;
