import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { refundOpSchema, type RefundOp } from "@/shared/schemas/refund-op";
import { documentConverter } from "./convert";

export const refundOpConverter = documentConverter(refundOpSchema);

export function refundOpsCollection(bookingId: string): CollectionReference<RefundOp> {
  return db.collection("bookings").doc(bookingId).collection("refundOps").withConverter(refundOpConverter);
}

export function refundOpDocument(bookingId: string, refundOpId: string): DocumentReference<RefundOp> {
  return refundOpsCollection(bookingId).doc(refundOpId);
}
