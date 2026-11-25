import "server-only";

import { z } from "zod";

export const serverEnvKeys = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "VRBO_ICAL_URL",
  "ICAL_EXPORT_TOKEN",
  "EMAIL_API_KEY",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "APP_BASE_URL",
  "SCHEDULER_SA_EMAIL",
  "STORAGE_BUCKET",
] as const;

export type ServerEnvKey = (typeof serverEnvKeys)[number];

export type ServerEnv = { [K in ServerEnvKey]: string | undefined };

const urlKeys = new Set<ServerEnvKey>(["VRBO_ICAL_URL", "APP_BASE_URL"]);
const emailKeys = new Set<ServerEnvKey>(["EMAIL_REPLY_TO", "SCHEDULER_SA_EMAIL"]);

const serverEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  VRBO_ICAL_URL: z.string().optional(),
  ICAL_EXPORT_TOKEN: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  APP_BASE_URL: z.string().optional(),
  SCHEDULER_SA_EMAIL: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
});

/**
 * Every value is optional until a feature reads it.
 * Present values are checked. Error text names the variable and never includes the value.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(readProcessEnv());
  if (!parsed.success) {
    const key = parsed.error.issues[0]?.path[0];
    if (typeof key === "string") {
      throw new Error(`Invalid server environment variable ${key}.`);
    }
    throw new Error("Invalid server environment.");
  }

  const env = blankToUndefined(parsed.data);
  for (const key of serverEnvKeys) {
    const value = env[key];
    if (value === undefined) continue;
    if (urlKeys.has(key) && !isHttpUrl(value)) {
      throw new Error(`Invalid server environment variable ${key}.`);
    }
    if (emailKeys.has(key) && !isEmail(value)) {
      throw new Error(`Invalid server environment variable ${key}.`);
    }
  }
  return env;
}

export function requireServerEnv(key: ServerEnvKey): string {
  const value = getServerEnv()[key];
  if (value === undefined) {
    throw new Error(`Missing server environment variable ${key}.`);
  }
  return value;
}

function readProcessEnv(): ServerEnv {
  return {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    VRBO_ICAL_URL: process.env.VRBO_ICAL_URL,
    ICAL_EXPORT_TOKEN: process.env.ICAL_EXPORT_TOKEN,
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
    APP_BASE_URL: process.env.APP_BASE_URL,
    SCHEDULER_SA_EMAIL: process.env.SCHEDULER_SA_EMAIL,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  };
}

function blankToUndefined(input: { [K in ServerEnvKey]?: string | undefined }): ServerEnv {
  return {
    STRIPE_SECRET_KEY: trimToUndefined(input.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: trimToUndefined(input.STRIPE_WEBHOOK_SECRET),
    VRBO_ICAL_URL: trimToUndefined(input.VRBO_ICAL_URL),
    ICAL_EXPORT_TOKEN: trimToUndefined(input.ICAL_EXPORT_TOKEN),
    EMAIL_API_KEY: trimToUndefined(input.EMAIL_API_KEY),
    EMAIL_FROM: trimToUndefined(input.EMAIL_FROM),
    EMAIL_REPLY_TO: trimToUndefined(input.EMAIL_REPLY_TO),
    APP_BASE_URL: trimToUndefined(input.APP_BASE_URL),
    SCHEDULER_SA_EMAIL: trimToUndefined(input.SCHEDULER_SA_EMAIL),
    STORAGE_BUCKET: trimToUndefined(input.STORAGE_BUCKET),
  };
}

function trimToUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
