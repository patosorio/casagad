import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "@/server/adapters/firestore/admin";
import {
  ratesMetaSchema,
  settingsPrivateSchema,
  settingsPublicSchema,
  type RatesMeta,
  type SettingsPrivate,
  type SettingsPublic,
} from "@/shared/schemas/settings";
import { documentConverter } from "./convert";

export const settingsPublicConverter = documentConverter(settingsPublicSchema);
export const settingsPrivateConverter = documentConverter(settingsPrivateSchema);
export const ratesMetaConverter = documentConverter(ratesMetaSchema);

export function settingsPublicDocument(): DocumentReference<SettingsPublic> {
  return db.collection("settings").doc("public").withConverter(settingsPublicConverter);
}

export function settingsPrivateDocument(): DocumentReference<SettingsPrivate> {
  return db.collection("settings").doc("private").withConverter(settingsPrivateConverter);
}

export function ratesMetaDocument(): DocumentReference<RatesMeta> {
  return db.collection("settings").doc("ratesMeta").withConverter(ratesMetaConverter);
}
