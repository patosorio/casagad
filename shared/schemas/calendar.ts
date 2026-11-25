import { z } from "zod";
import { dateStrSchema, isExclusiveRange } from "./common";
import { nightKinds } from "./night";

export const unavailableRangeSchema = z
  .strictObject({
    from: dateStrSchema,
    to: dateStrSchema,
  })
  .superRefine((range, ctx) => {
    if (!isExclusiveRange(range.from, range.to)) {
      ctx.addIssue({ code: "custom", message: "to must be after from", path: ["to"] });
    }
  });

export const publicCalendarSchema = z.strictObject({
  unavailable: z.array(unavailableRangeSchema),
  updatedAt: z.date(),
  version: z.number().int().nonnegative(),
});

export type PublicCalendar = z.infer<typeof publicCalendarSchema>;

export const familyRangeSchema = z
  .strictObject({
    from: dateStrSchema,
    to: dateStrSchema,
    ref: z.string().min(1).max(40),
    guestFirstName: z.string().max(80),
    kind: z.enum(nightKinds),
  })
  .superRefine((range, ctx) => {
    if (!isExclusiveRange(range.from, range.to)) {
      ctx.addIssue({ code: "custom", message: "to must be after from", path: ["to"] });
    }
  });

export const familyCalendarSchema = z.strictObject({
  ranges: z.array(familyRangeSchema),
  version: z.number().int().nonnegative(),
});

export type FamilyCalendar = z.infer<typeof familyCalendarSchema>;
