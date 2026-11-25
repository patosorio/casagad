import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { stripeEventSchema, type StripeEvent } from "@/shared/schemas/stripe-event";
import { documentConverter } from "./convert";

export const stripeEventConverter = documentConverter(stripeEventSchema);

export function stripeEventsCollection(): CollectionReference<StripeEvent> {
  return db.collection("stripeEvents").withConverter(stripeEventConverter);
}

export function stripeEventDocument(eventId: string): DocumentReference<StripeEvent> {
  return stripeEventsCollection().doc(eventId);
}
