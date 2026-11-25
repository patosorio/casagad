import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const SECRET_MARKERS = [
  "sk_live",
  "sk_test",
  "whsec_",
  "re_",
  "-----BEGIN PRIVATE KEY-----",
  "-----BEGIN RSA PRIVATE KEY-----",
  "-----BEGIN OPENSSH PRIVATE KEY-----",
] as const;

export type SecretMarker = (typeof SECRET_MARKERS)[number];

export type SecretHit = {
  file: string;
  marker: SecretMarker;
};

const LITERAL_MARKERS = [
  "sk_live",
  "sk_test",
  "whsec_",
  "-----BEGIN PRIVATE KEY-----",
  "-----BEGIN RSA PRIVATE KEY-----",
  "-----BEGIN OPENSSH PRIVATE KEY-----",
] as const satisfies readonly SecretMarker[];

const BUILD_ROOTS = [".next/static", ".next/server/app"] as const;

export function markersInText(text: string): SecretMarker[] {
  const found: SecretMarker[] = [];
  for (const marker of LITERAL_MARKERS) {
    if (text.includes(marker)) found.push(marker);
  }
  if (hasResendMarker(text)) found.push("re_");
  return found;
}

/**
 * `re_` is the Resend key prefix. Next's trace files contain `require_`, whose
 * letters include `re_`. A hit must start a token, not sit inside a word.
 */
function hasResendMarker(text: string): boolean {
  let from = 0;
  while (from < text.length) {
    const at = text.indexOf("re_", from);
    if (at === -1) return false;
    const before = at > 0 ? text.charAt(at - 1) : "";
    const after = text.charAt(at + 3);
    const insideWord = before !== "" && /[A-Za-z]/.test(before);
    const startsKey = after !== "" && /[A-Za-z0-9]/.test(after);
    if (!insideWord && startsKey) return true;
    from = at + 3;
  }
  return false;
}

export function formatSecretHit(hit: SecretHit): string {
  return `Secret marker ${hit.marker} found in ${hit.file}.`;
}

export async function scanBuildOutput(cwd = process.cwd()): Promise<{ missing: string[]; hits: SecretHit[] }> {
  const missing: string[] = [];
  const hits: SecretHit[] = [];

  for (const relativeRoot of BUILD_ROOTS) {
    const root = path.join(cwd, relativeRoot);
    try {
      const info = await stat(root);
      if (!info.isDirectory()) {
        missing.push(relativeRoot);
        continue;
      }
    } catch {
      missing.push(relativeRoot);
      continue;
    }

    const found = await findSecretMarkers(root);
    for (const hit of found) {
      hits.push({ marker: hit.marker, file: path.join(relativeRoot, hit.file) });
    }
  }

  return { missing, hits };
}

export async function findSecretMarkers(root: string): Promise<SecretHit[]> {
  const hits: SecretHit[] = [];
  await walk(root, root, hits);
  return hits;
}

async function walk(directory: string, root: string, hits: SecretHit[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(full, root, hits);
      continue;
    }
    if (!entry.isFile() || !shouldScan(entry.name)) continue;
    const text = await readFile(full, "utf8");
    const relative = path.relative(root, full);
    for (const marker of markersInText(text)) {
      hits.push({ file: relative, marker });
    }
  }
}

function shouldScan(name: string): boolean {
  if (name.endsWith(".nft.json") || name.endsWith(".map")) return false;
  return true;
}

async function main(): Promise<void> {
  const { missing, hits } = await scanBuildOutput();
  let failed = false;

  for (const directory of missing) {
    console.error(`Missing build output: ${directory}. Run npm run build first.`);
    failed = true;
  }

  for (const hit of hits) {
    console.error(formatSecretHit(hit));
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log("No secret markers in build output.");
}

const invoked = process.argv[1] ?? "";
if (invoked.endsWith("check-bundle-secrets.ts") || invoked.endsWith("check-bundle-secrets.js")) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Bundle secret scan failed.";
    console.error(message);
    process.exit(1);
  });
}
