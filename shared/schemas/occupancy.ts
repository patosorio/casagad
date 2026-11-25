import { z } from "zod";

export const occupancySchema = z.strictObject({
  version: z.number().int().nonnegative(),
});

export type OccupancyMeta = z.infer<typeof occupancySchema>;
