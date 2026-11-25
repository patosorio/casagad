import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { bookingSchema, type Booking } from "@/shared/schemas/booking";
import { documentConverter } from "./convert";

export const bookingConverter = documentConverter(bookingSchema);

export function bookingsCollection(): CollectionReference<Booking> {
  return db.collection("bookings").withConverter(bookingConverter);
}

export function bookingDocument(id: string): DocumentReference<Booking> {
  return bookingsCollection().doc(id);
}
