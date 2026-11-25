"use client";

import { getApps } from "firebase/app";
import { getToken, initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";
import { isAppCheckDebugEnabled } from "@/lib/firebase/appCheckDebug";
import { getClientAuth } from "@/lib/firebase/client";

export { isAppCheckDebugEnabled };

const APP_CHECK_HEADER = "X-Firebase-AppCheck";

let appCheck: AppCheck | undefined;

/**
 * Header for browser fetches that the server will check with the Admin SDK.
 * Call this from the client. It does not read Firestore or Storage.
 */
export async function getAppCheckHeader(): Promise<Record<typeof APP_CHECK_HEADER, string>> {
  const { token } = await getToken(getClientAppCheck(), false);
  return { [APP_CHECK_HEADER]: token };
}

function getClientAppCheck(): AppCheck {
  if (appCheck) return appCheck;

  getClientAuth();
  const app = getApps()[0];
  if (!app) {
    throw new Error(
      "Missing Firebase web config: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID.",
    );
  }

  if (isAppCheckDebugEnabled()) {
    Object.assign(globalThis, { FIREBASE_APPCHECK_DEBUG_TOKEN: true });
  }

  const siteKey = nonEmpty(process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY);
  if (!siteKey) {
    throw new Error("Missing NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY.");
  }

  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheck;
}

function nonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
