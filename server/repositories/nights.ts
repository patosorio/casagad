import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { nightSchema, type Night } from "@/shared/schemas/night";
import { documentConverter } from "./convert";

export const nightConverter = documentConverter(nightSchema);

export function nightsCollection(): CollectionReference<Night> {
  return db.collection("nights").withConverter(nightConverter);
}

export function nightDocument(date: string): DocumentReference<Night> {
  return nightsCollection().doc(date);
}
