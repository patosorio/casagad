"use client";

import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const PUBLIC_CONFIG_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/**
 * Browser Firebase app for sign-in only.
 * Firestore and Storage stay on the server. This module does not import them.
 */
let auth: Auth | undefined;

export function getClientAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(getFirebaseApp());
  return auth;
}

function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp(readWebConfig());
}

function readWebConfig(): FirebaseOptions {
  const hosted = readHostedWebConfig();
  if (hosted) return hosted;

  const apiKey = nonEmpty(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const authDomain = nonEmpty(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = nonEmpty(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const appId = nonEmpty(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  if (!apiKey || !authDomain || !projectId || !appId) {
    const missing = PUBLIC_CONFIG_KEYS.filter((key) => nonEmpty(process.env[key]) === undefined);
    throw new Error(`Missing Firebase web config: ${missing.join(", ")}.`);
  }

  return { apiKey, authDomain, projectId, appId };
}

/**
 * App Hosting sets FIREBASE_WEBAPP_CONFIG at build and runtime.
 * When it is visible, it wins over NEXT_PUBLIC_FIREBASE_*. The value is public web config.
 */
function readHostedWebConfig(): FirebaseOptions | undefined {
  const raw = nonEmpty(process.env.FIREBASE_WEBAPP_CONFIG);
  if (!raw) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
  }

  if (!isRecord(parsed)) {
    throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
  }

  const apiKey = readString(parsed, "apiKey");
  const authDomain = readString(parsed, "authDomain");
  const projectId = readString(parsed, "projectId");
  const appId = readString(parsed, "appId");
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
  }

  const config: FirebaseOptions = { apiKey, authDomain, projectId, appId };
  const storageBucket = readString(parsed, "storageBucket");
  const messagingSenderId = readString(parsed, "messagingSenderId");
  const measurementId = readString(parsed, "measurementId");
  if (storageBucket) config.storageBucket = storageBucket;
  if (messagingSenderId) config.messagingSenderId = messagingSenderId;
  if (measurementId) config.measurementId = measurementId;
  return config;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return nonEmpty(typeof value === "string" ? value : undefined);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmpty(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
