import { z } from "zod";

export const userRoles = ["owner", "family"] as const;

export const userSchema = z.strictObject({
  email: z.email(),
  displayName: z.string().min(1).max(80),
  role: z.enum(userRoles),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
