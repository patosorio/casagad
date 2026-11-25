import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { imageCatalog, outputWidthsFor } from "../lib/content/photos";

const AVIF_QUALITY = 50;
const WEBP_QUALITY = 75;

type Variant = { width: number; path: string };

type ManifestEntry = {
  width: number;
  height: number;
  avif: Variant[];
  webp: Variant[];
};

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "..");
const repoRoot = path.resolve(webRoot, "..");

async function existingDirectory(candidates: readonly string[]): Promise<string> {
  for (const dir of candidates) {
    try {
      await access(dir);
      return dir;
    } catch {
      continue;
    }
  }
  throw new Error("Image folder not found. Expected ../images or ../03-design/images.");
}

function orientedSize(width: number, height: number, orientation: number | undefined): { width: number; height: number } {
  if (orientation !== undefined && orientation >= 5 && orientation <= 8) {
    return { width: height, height: width };
  }
  return { width, height };
}

async function main(): Promise<void> {
  const sourceDir = await existingDirectory([
    path.join(repoRoot, "images"),
    path.join(repoRoot, "03-design", "images"),
  ]);

  const missing: string[] = [];
  for (const item of imageCatalog) {
    try {
      await access(path.join(sourceDir, item.file));
    } catch {
      missing.push(item.file);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing source photos: ${missing.join(", ")}`);
  }

  const outDir = path.join(webRoot, "public", "images");
  await mkdir(outDir, { recursive: true });

  const manifest: Record<string, ManifestEntry> = {};

  for (const item of imageCatalog) {
    const sourcePath = path.join(sourceDir, item.file);
    const meta = await sharp(sourcePath).metadata();
    if (meta.width === undefined || meta.height === undefined) {
      throw new Error(`No pixel size for ${item.file}`);
    }
    const oriented = orientedSize(meta.width, meta.height, meta.orientation);
    const widths = outputWidthsFor(oriented.width);
    const avif: Variant[] = [];
    const webp: Variant[] = [];

    for (const width of widths) {
      const base = `${item.slug}-${width}`;
      const avifName = `${base}.avif`;
      const webpName = `${base}.webp`;
      const pipeline = () => sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });
      await pipeline().avif({ quality: AVIF_QUALITY }).toFile(path.join(outDir, avifName));
      await pipeline().webp({ quality: WEBP_QUALITY }).toFile(path.join(outDir, webpName));
      avif.push({ width, path: `/images/${avifName}` });
      webp.push({ width, path: `/images/${webpName}` });
    }

    const largest = widths[widths.length - 1];
    if (largest === undefined) throw new Error(`No output width for ${item.file}`);
    manifest[item.id] = {
      width: largest,
      height: Math.round((oriented.height * largest) / oriented.width),
      avif,
      webp,
    };
  }

  const manifestPath = path.join(webRoot, "lib", "content", "image-manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`Wrote ${Object.keys(manifest).length} photos to public/images\n`);
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

if (isDirectRun()) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Image optimisation failed";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
