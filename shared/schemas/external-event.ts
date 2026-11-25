import { z } from "zod";
import { dateStrSchema, isExclusiveRange } from "./common";

export const externalEventSchema = z
  .strictObject({
    from: dateStrSchema,
    to: dateStrSchema,
    summary: z.string().max(500),
    lastSeenAt: z.date(),
    conflictBookingId: z.string().min(1).max(128).optional(),
    missingSince: z.date().optional(),
  })
  .superRefine((event, ctx) => {
    if (!isExclusiveRange(event.from, event.to)) {
      ctx.addIssue({ code: "custom", message: "to must be after from", path: ["to"] });
    }
  });

export type ExternalEvent = z.infer<typeof externalEventSchema>;
