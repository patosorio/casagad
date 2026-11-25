import { z } from "zod";

export const outboxStatuses = ["pending", "processing", "done", "failed"] as const;

export const outboxItemSchema = z.strictObject({
  type: z.string().min(1).max(80),
  ref: z.string().min(1).max(200),
  status: z.enum(outboxStatuses),
  attempts: z.number().int().min(0).max(100),
  leaseUntil: z.date().optional(),
  nextAttemptAt: z.date(),
  lastError: z.string().max(300).optional(),
  createdAt: z.date(),
  doneAt: z.date().optional(),
});

export type OutboxItem = z.infer<typeof outboxItemSchema>;
