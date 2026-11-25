import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import { familyCalendarSchema, type FamilyCalendar } from "@/shared/schemas/calendar";
import { documentConverter } from "./convert";

export const familyCalendarConverter = documentConverter(familyCalendarSchema);

export function familyCalendarDocument(): DocumentReference<FamilyCalendar> {
  return db.collection("familyCalendar").doc("current").withConverter(familyCalendarConverter);
}
