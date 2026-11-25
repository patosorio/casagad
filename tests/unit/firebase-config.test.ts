import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isAppCheckDebugEnabled } from "@/lib/firebase/appCheckDebug";
import { formatSecretHit, markersInText, scanBuildOutput } from "@/scripts/check-bundle-secrets";

const root = process.cwd();

describe("App Check debug", () => {
  it("turns the debug token on only in development when the flag is true", () => {
    expect(isAppCheckDebugEnabled({ NODE_ENV: "development", NEXT_PUBLIC_APPCHECK_DEBUG: "true" })).toBe(true);
    expect(isAppCheckDebugEnabled({ NODE_ENV: "development", NEXT_PUBLIC_APPCHECK_DEBUG: "false" })).toBe(false);
    expect(isAppCheckDebugEnabled({ NODE_ENV: "production", NEXT_PUBLIC_APPCHECK_DEBUG: "true" })).toBe(false);
    expect(isAppCheckDebugEnabled({ NODE_ENV: "test", NEXT_PUBLIC_APPCHECK_DEBUG: "true" })).toBe(false);
  });
});

describe("client and server boundaries", () => {
  it("keeps Firestore and Storage client SDKs out of the browser modules", () => {
    const client = readFileSync(join(root, "lib/firebase/client.ts"), "utf8");
    const appCheck = readFileSync(join(root, "lib/firebase/appCheck.ts"), "utf8");

    for (const source of [client, appCheck]) {
      expect(source).not.toContain("firebase/firestore");
      expect(source).not.toContain("firebase/storage");
    }

    expect(client).toContain("firebase/auth");
    expect(appCheck).toContain("firebase/app-check");
    expect(appCheck).toContain("ReCaptchaEnterpriseProvider");
  });

  it("starts every server module with server-only", () => {
    const files = tsFiles(join(root, "server"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source.startsWith('import "server-only"'), file).toBe(true);
      expect(source).not.toContain("BEGIN PRIVATE KEY");
      expect(source).not.toContain("private_key");
    }
  });
});

describe("env example and emulator config", () => {
  it("lists names only in .env.example", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    const names = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY",
      "NEXT_PUBLIC_APPCHECK_DEBUG",
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
      "FIRESTORE_EMULATOR_HOST",
      "FIREBASE_AUTH_EMULATOR_HOST",
      "FIREBASE_STORAGE_EMULATOR_HOST",
      "GCLOUD_PROJECT",
    ];

    for (const name of names) {
      expect(example).toContain(`${name}=`);
    }

    for (const line of example.split("\n")) {
      const trimmed = line.trim();
      if (trimmed === "" || trimmed.startsWith("#")) continue;
      expect(trimmed.endsWith("="), trimmed).toBe(true);
    }

    expect(example).not.toContain("sk_live");
    expect(example).not.toContain("sk_test");
    expect(example).not.toContain("whsec_");
  });

  it("configures emulators and deny-all rules without Hosting", () => {
    const firebase = parseRecord(readFileSync(join(root, "firebase.json"), "utf8"));
    expect(firebase.hosting).toBeUndefined();
    const emulators = recordValue(firebase, "emulators");
    expect(emulators?.auth).toBeDefined();
    expect(emulators?.firestore).toBeDefined();
    expect(emulators?.storage).toBeDefined();
    expect(emulators?.ui).toBeDefined();

    const project = parseRecord(readFileSync(join(root, ".firebaserc"), "utf8"));
    const projects = recordValue(project, "projects");
    expect(projects?.default).toBe("casagad-c1f81");

    expect(readFileSync(join(root, "firestore.rules"), "utf8")).toContain("if false");
    expect(readFileSync(join(root, "storage.rules"), "utf8")).toContain("if false");
  });

  it("references the five secrets and does not embed values", () => {
    const yaml = readFileSync(join(root, "apphosting.yaml"), "utf8");
    for (const name of [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "VRBO_ICAL_URL",
      "ICAL_EXPORT_TOKEN",
      "EMAIL_API_KEY",
    ]) {
      expect(yaml).toContain(`secret: ${name}`);
    }
    expect(yaml).toContain("minInstances: 0");
    expect(yaml).toContain("maxInstances: 2");
    expect(yaml).toContain("concurrency: 80");
    expect(yaml).toContain("cpu: 1");
    expect(yaml).toContain("memoryMiB: 512");
    expect(yaml).toContain('"<set in console>"');
    expect(yaml).not.toContain("sk_live");
    expect(yaml).not.toContain("sk_test");
    expect(yaml).not.toContain("whsec_");
    expect(yaml).not.toMatch(/^hosting:/m);
  });
});

describe("bundle secret scan", () => {
  it("flags key markers and ignores re_ inside require_", () => {
    const leaked = "re_DO_NOT_LEAK_991";
    expect(markersInText(`prefix ${leaked} suffix`)).toContain("re_");
    expect(markersInText("node_modules/@swc/helpers/cjs/_interop_require_default.cjs")).not.toContain("re_");
    expect(markersInText("sk_test_DO_NOT_LEAK_991")).toContain("sk_test");
    expect(markersInText("-----BEGIN PRIVATE KEY-----")).toContain("-----BEGIN PRIVATE KEY-----");

    const hit = formatSecretHit({ file: ".next/static/chunk.js", marker: "re_" });
    expect(hit).toBe("Secret marker re_ found in .next/static/chunk.js.");
    expect(hit).not.toContain("DO_NOT_LEAK_991");
  });

  it("reports a hit under build output and ignores a clean file", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "casagad-scan-"));
    await mkdir(join(cwd, ".next/static"), { recursive: true });
    await mkdir(join(cwd, ".next/server/app"), { recursive: true });
    await writeFile(join(cwd, ".next/static/app.js"), "var ok = true;\n");
    await writeFile(join(cwd, ".next/server/app/index.html"), "<html>clean</html>\n");

    const clean = await scanBuildOutput(cwd);
    expect(clean.missing).toEqual([]);
    expect(clean.hits).toEqual([]);

    await writeFile(join(cwd, ".next/static/leak.js"), "const key = 'whsec_DO_NOT_LEAK_991';\n");
    const dirty = await scanBuildOutput(cwd);
    expect(dirty.hits).toEqual([{ file: join(".next/static", "leak.js"), marker: "whsec_" }]);
    const hit = dirty.hits[0];
    expect(hit).toBeDefined();
    if (hit) expect(formatSecretHit(hit)).not.toContain("DO_NOT_LEAK_991");
  });
});

function parseRecord(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) throw new Error("Expected a JSON object.");
  return parsed;
}

function recordValue(record: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tsFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...tsFiles(full));
    else if (entry.name.endsWith(".ts")) found.push(full);
  }
  return found;
}
