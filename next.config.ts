import type { NextConfig } from "next";
import { headerRules } from "./lib/security/response-headers";

// App Hosting provides FIREBASE_WEBAPP_CONFIG at build time. Copy the public
// fields onto NEXT_PUBLIC_FIREBASE_* so the browser bundle can see them.
// Client code prefers that hosted config over placeholders.
applyHostedWebConfig();

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    // Three root layouts replace app/layout.tsx. Next 16.4 needs this so an
    // unmatched URL can return app/global-not-found.tsx with HTTP 404.
    globalNotFound: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return headerRules();
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

function applyHostedWebConfig(): void {
  const raw = process.env.FIREBASE_WEBAPP_CONFIG;
  if (raw === undefined || raw.trim() === "") return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
  }

  if (!isRecord(parsed)) {
    throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
  }

  const fields = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", "apiKey"],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "authDomain"],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "projectId"],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", "appId"],
  ] as const;

  for (const [envName, field] of fields) {
    const value = parsed[field];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("FIREBASE_WEBAPP_CONFIG is not valid Firebase web config.");
    }
    process.env[envName] = value.trim();
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
