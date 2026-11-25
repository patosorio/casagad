import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { guestRegistryEntrySchema, type GuestRegistryEntry } from "@/shared/schemas/guest-registry";
import { documentConverter } from "./convert";

export const guestRegistryConverter = documentConverter(guestRegistryEntrySchema);

export function guestRegistryCollection(bookingId: string): CollectionReference<GuestRegistryEntry> {
  return db
    .collection("bookings")
    .doc(bookingId)
    .collection("guestRegistry")
    .withConverter(guestRegistryConverter);
}

export function guestRegistryDocument(
  bookingId: string,
  entryId: string,
): DocumentReference<GuestRegistryEntry> {
  return guestRegistryCollection(bookingId).doc(entryId);
}
