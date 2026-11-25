import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { settingsPublicDocument } from "@/server/repositories/settings";
import type { SettingsPublic } from "@/shared/schemas/settings";

export type PublicSettingsResult =
  | { status: "ok"; settings: SettingsPublic }
  | { status: "empty" }
  | { status: "error" };

/** One read of settings/public per request. Never substitutes example copy. */
export const readPublicSettings = cache(async (): Promise<PublicSettingsResult> => {
  await connection();
  try {
    const snapshot = await settingsPublicDocument().get();
    if (!snapshot.exists) return { status: "empty" };
    const settings = snapshot.data();
    if (!settings) return { status: "empty" };
    return { status: "ok", settings };
  } catch {
    return { status: "error" };
  }
});
