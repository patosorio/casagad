import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { publicCalendarSchema, type PublicCalendar } from "@/shared/schemas/calendar";
import { documentConverter } from "./convert";

export const publicCalendarConverter = documentConverter(publicCalendarSchema);

export function publicCalendarDocument(): DocumentReference<PublicCalendar> {
  return db.collection("public").doc("calendar").withConverter(publicCalendarConverter);
}
