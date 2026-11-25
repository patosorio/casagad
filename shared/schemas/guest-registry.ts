import { z } from "zod";
import { dateStrSchema } from "./common";

export const guestRegistryRoles = ["head", "member"] as const;

const roleSchema = z.enum(guestRegistryRoles);

const activeGuestRegistryEntrySchema = z.strictObject({
  role: roleSchema,
  surname: z.string().min(1).max(80),
  givenName: z.string().min(1).max(80),
  sex: z.string().min(1).max(16),
  birthDate: dateStrSchema,
  birthPlace: z.string().min(1).max(80),
  citizenship: z.string().min(1).max(80),
  docType: z.string().min(1).max(40),
  docNumber: z.string().min(1).max(40),
  docIssuedPlace: z.string().min(1).max(80),
  submittedAt: z.date().optional(),
  exportedAt: z.date().optional(),
  purgeAfter: z.date().optional(),
});

const purgedGuestRegistryEntrySchema = z.strictObject({
  role: roleSchema,
  purgedAt: z.date(),
  submittedAt: z.date().optional(),
  exportedAt: z.date().optional(),
});

export const guestRegistryEntrySchema = z.union([activeGuestRegistryEntrySchema, purgedGuestRegistryEntrySchema]);

export type GuestRegistryEntry = z.infer<typeof guestRegistryEntrySchema>;
