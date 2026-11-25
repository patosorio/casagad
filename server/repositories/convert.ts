import "server-only";

import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  type SetOptions,
  type WithFieldValue,
} from "firebase-admin/firestore";
import type { ZodType } from "zod";

/**
 * Typed read/write for one collection. Parses the stored shape.
 * Does not apply booking, price, or role rules.
 */
export function documentConverter<T>(schema: ZodType<T>): FirestoreDataConverter<T> {
  function toFirestore(model: WithFieldValue<T>): WithFieldValue<DocumentData>;
  function toFirestore(
    model: PartialWithFieldValue<T>,
    options: SetOptions,
  ): PartialWithFieldValue<DocumentData>;
  function toFirestore(
    model: WithFieldValue<T> | PartialWithFieldValue<T>,
    options?: SetOptions,
  ): DocumentData {
    if (options !== undefined) return toFirestoreDocument(model);
    return toFirestoreDocument(schema.parse(model));
  }

  function fromFirestore(snapshot: QueryDocumentSnapshot): T {
    return schema.parse(fromFirestoreValue(snapshot.data()));
  }

  return { toFirestore, fromFirestore };
}

export function toFirestoreDocument(value: unknown): DocumentData {
  const encoded = toFirestoreValue(value);
  if (!isPlainRecord(encoded)) throw new Error("A Firestore document must be an object.");
  const document: DocumentData = {};
  for (const [key, inner] of Object.entries(encoded)) {
    document[key] = inner;
  }
  return document;
}

export function fromFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map((item) => fromFirestoreValue(item));
  if (!isPlainRecord(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value)) {
    out[key] = fromFirestoreValue(inner);
  }
  return out;
}

function toFirestoreValue(value: unknown): unknown {
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map((item) => toFirestoreValue(item));
  }
  if (!isPlainRecord(value)) return value;
  const out: DocumentData = {};
  for (const [key, inner] of Object.entries(value)) {
    if (inner === undefined) continue;
    out[key] = toFirestoreValue(inner);
  }
  return out;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
