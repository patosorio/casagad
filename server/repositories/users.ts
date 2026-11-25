import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { userSchema, type User } from "@/shared/schemas/user";
import { documentConverter } from "./convert";

export const userConverter = documentConverter(userSchema);

export function usersCollection(): CollectionReference<User> {
  return db.collection("users").withConverter(userConverter);
}

export function userDocument(uid: string): DocumentReference<User> {
  return usersCollection().doc(uid);
}
