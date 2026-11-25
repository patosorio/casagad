import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { messageSchema, type Message } from "@/shared/schemas/message";
import { documentConverter } from "./convert";

export const messageConverter = documentConverter(messageSchema);

export function messagesCollection(): CollectionReference<Message> {
  return db.collection("messages").withConverter(messageConverter);
}

export function messageDocument(id: string): DocumentReference<Message> {
  return messagesCollection().doc(id);
}
