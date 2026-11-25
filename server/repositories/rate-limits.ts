import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { rateLimitSchema, type RateLimit } from "@/shared/schemas/rate-limit";
import { documentConverter } from "./convert";

export const rateLimitConverter = documentConverter(rateLimitSchema);

export function rateLimitsCollection(): CollectionReference<RateLimit> {
  return db.collection("rateLimits").withConverter(rateLimitConverter);
}

export function rateLimitDocument(key: string): DocumentReference<RateLimit> {
  return rateLimitsCollection().doc(key);
}
