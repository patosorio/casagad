import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { counterSchema, type Counter } from "@/shared/schemas/counter";
import { documentConverter } from "./convert";

export const counterConverter = documentConverter(counterSchema);

export function countersCollection(): CollectionReference<Counter> {
  return db.collection("counters").withConverter(counterConverter);
}

export function counterDocument(name: string): DocumentReference<Counter> {
  return countersCollection().doc(name);
}
