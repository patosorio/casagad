import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { syncStateSchema, type SyncState } from "@/shared/schemas/sync-state";
import { documentConverter } from "./convert";

export const syncStateConverter = documentConverter(syncStateSchema);

export function syncStateDocument(): DocumentReference<SyncState> {
  return db.collection("syncState").doc("vrbo").withConverter(syncStateConverter);
}
