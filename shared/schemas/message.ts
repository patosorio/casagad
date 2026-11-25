import { z } from "zod";
import { localeSchema } from "./common";

export const messageStatuses = ["new", "done"] as const;

export const messageSchema = z.strictObject({
  name: z.string().min(1).max(80),
  email: z.email(),
  locale: localeSchema,
  body: z.string().min(1).max(2000),
  status: z.enum(messageStatuses),
  createdAt: z.date(),
});

export type Message = z.infer<typeof messageSchema>;
