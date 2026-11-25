import { z } from "zod";
import { dateStrSchema, isExclusiveRange } from "./common";

export const blockReasons = ["owner", "family", "maintenance"] as const;

export const blockSchema = z
  .strictObject({
    from: dateStrSchema,
    to: dateStrSchema,
    reason: z.enum(blockReasons),
    note: z.string().max(500).optional(),
    createdBy: z.string().min(1).max(128),
  })
  .superRefine((block, ctx) => {
    if (!isExclusiveRange(block.from, block.to)) {
      ctx.addIssue({ code: "custom", message: "to must be after from", path: ["to"] });
    }
  });

export type Block = z.infer<typeof blockSchema>;
