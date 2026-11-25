import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { paymentSchema, type Payment } from "@/shared/schemas/payment";
import { documentConverter } from "./convert";

export const paymentConverter = documentConverter(paymentSchema);

export function paymentsCollection(bookingId: string): CollectionReference<Payment> {
  return db.collection("bookings").doc(bookingId).collection("payments").withConverter(paymentConverter);
}

export function paymentDocument(bookingId: string, paymentId: string): DocumentReference<Payment> {
  return paymentsCollection(bookingId).doc(paymentId);
}
