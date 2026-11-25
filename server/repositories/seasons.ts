import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { seasonSchema, type Season } from "@/shared/schemas/season";
import { documentConverter } from "./convert";

export const seasonConverter = documentConverter(seasonSchema);

export function seasonsCollection(): CollectionReference<Season> {
  return db.collection("seasons").withConverter(seasonConverter);
}

export function seasonDocument(id: string): DocumentReference<Season> {
  return seasonsCollection().doc(id);
}
