import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { auditEntrySchema, type AuditEntry } from "@/shared/schemas/audit";
import { documentConverter } from "./convert";

export const auditEntryConverter = documentConverter(auditEntrySchema);

export function auditLogCollection(): CollectionReference<AuditEntry> {
  return db.collection("auditLog").withConverter(auditEntryConverter);
}

export function auditEntryDocument(id: string): DocumentReference<AuditEntry> {
  return auditLogCollection().doc(id);
}
