import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { outboxItemSchema, type OutboxItem } from "@/shared/schemas/outbox";
import { documentConverter } from "./convert";

export const outboxConverter = documentConverter(outboxItemSchema);

export function outboxCollection(): CollectionReference<OutboxItem> {
  return db.collection("outbox").withConverter(outboxConverter);
}

export function outboxDocument(opId: string): DocumentReference<OutboxItem> {
  return outboxCollection().doc(opId);
}
