import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { occupancySchema, type OccupancyMeta } from "@/shared/schemas/occupancy";
import { documentConverter } from "./convert";

export const occupancyConverter = documentConverter(occupancySchema);

export function occupancyDocument(): DocumentReference<OccupancyMeta> {
  return db.collection("meta").doc("occupancy").withConverter(occupancyConverter);
}
