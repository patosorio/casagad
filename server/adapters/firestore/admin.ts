import "server-only";

import { applicationDefault, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Admin SDK via Application Default Credentials.
 * First use reads emulator host variables. When any host is set, credentials are not loaded.
 * No service-account key file. The SDK itself talks to the emulator hosts.
 */
const projectId = nonEmpty(process.env.GCLOUD_PROJECT) ?? "casagad-c1f81";

let app: App | undefined;

export const db = lazy(() => getFirestore(adminApp()));
export const auth = lazy(() => getAuth(adminApp()));
export const appCheck = lazy(() => getAppCheck(adminApp()));
export const bucket = lazy(() => {
  const name = nonEmpty(process.env.STORAGE_BUCKET);
  if (!name) {
    throw new Error("Missing server environment variable STORAGE_BUCKET.");
  }
  return getStorage(adminApp()).bucket(name);
});

function adminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return existing;
  }

  const storageBucket = nonEmpty(process.env.STORAGE_BUCKET);
  const options = {
    projectId,
    ...(storageBucket ? { storageBucket } : {}),
  };

  app = usesEmulators()
    ? initializeApp(options)
    : initializeApp({ ...options, credential: applicationDefault() });
  return app;
}

function usesEmulators(): boolean {
  return (
    nonEmpty(process.env.FIRESTORE_EMULATOR_HOST) !== undefined ||
    nonEmpty(process.env.FIREBASE_AUTH_EMULATOR_HOST) !== undefined ||
    nonEmpty(process.env.FIREBASE_STORAGE_EMULATOR_HOST) !== undefined
  );
}

function lazy<T extends object>(create: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, property) {
      instance ??= create();
      const value: unknown = Reflect.get(instance, property);
      if (typeof value === "function") {
        return value.bind(instance);
      }
      return value;
    },
  });
}

function nonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
