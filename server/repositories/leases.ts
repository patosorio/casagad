import "server-only";

import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { leaseSchema, type Lease } from "@/shared/schemas/lease";
import { documentConverter } from "./convert";

export const leaseConverter = documentConverter(leaseSchema);

export function leasesCollection(): CollectionReference<Lease> {
  return db.collection("leases").withConverter(leaseConverter);
}

export function leaseDocument(name: string): DocumentReference<Lease> {
  return leasesCollection().doc(name);
}
