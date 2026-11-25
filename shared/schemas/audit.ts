import { z } from "zod";

export const auditEntrySchema = z.strictObject({
  uid: z.string().min(1).max(128),
  action: z.string().min(1).max(80),
  target: z.string().min(1).max(300),
  at: z.date(),
});

export type AuditEntry = z.infer<typeof auditEntrySchema>;
