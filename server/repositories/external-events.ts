import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { externalEventSchema, type ExternalEvent } from "@/shared/schemas/external-event";
import { documentConverter } from "./convert";

export const externalEventConverter = documentConverter(externalEventSchema);

export function externalEventsCollection(): CollectionReference<ExternalEvent> {
  return db.collection("externalEvents").withConverter(externalEventConverter);
}

export function externalEventDocument(uid: string): DocumentReference<ExternalEvent> {
  return externalEventsCollection().doc(uid);
}
