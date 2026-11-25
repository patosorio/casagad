import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { blockSchema, type Block } from "@/shared/schemas/block";
import { documentConverter } from "./convert";

export const blockConverter = documentConverter(blockSchema);

export function blocksCollection(): CollectionReference<Block> {
  return db.collection("blocks").withConverter(blockConverter);
}

export function blockDocument(id: string): DocumentReference<Block> {
  return blocksCollection().doc(id);
}
