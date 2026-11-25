import { z } from "zod";
import { centsSchema, dateStrSchema, isExclusiveRange, l10nSchema } from "./common";

export const seasonSchema = z
  .strictObject({
    name: l10nSchema,
    from: dateStrSchema,
    to: dateStrSchema,
    nightlyCents: centsSchema,
    minNights: z.number().int().min(1).max(60),
    active: z.boolean(),
  })
  .superRefine((season, ctx) => {
    if (!isExclusiveRange(season.from, season.to)) {
      ctx.addIssue({ code: "custom", message: "to must be after from", path: ["to"] });
    }
  });

export type Season = z.infer<typeof seasonSchema>;
