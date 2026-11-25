import manifestFile from "./image-manifest.json";

const WIDTHS = [640, 1024, 1600, 2400] as const;
const FALLBACK_WIDTH = 640;
const FALLBACK_HEIGHT = 428;

export const imageCatalog = [
  { id: "0745", file: "IMG_0745.JPG", slug: "terrazza-lettini-vista-mare" },
  { id: "0746", file: "IMG_0746.JPG", slug: "veranda-tende-bianche" },
  { id: "0747", file: "IMG_0747.JPG", slug: "lettini-terrazza-alberi" },
  { id: "0748", file: "IMG_0748.JPG", slug: "bouganville-lettini-mare" },
  { id: "0749", file: "IMG_0749.JPG", slug: "spiaggia-simius-aerea" },
  { id: "0752", file: "IMG_0752.JPG", slug: "veranda-tavolo-divano" },
  { id: "0754", file: "IMG_0754.JPG", slug: "veranda-pranzo-aperto" },
  { id: "0756", file: "IMG_0756.JPG", slug: "cucina-piastrelle" },
  { id: "0757", file: "IMG_0757.JPG", slug: "cucina-frigorifero-forno" },
  { id: "0758", file: "IMG_0758.JPG", slug: "prato-giardino-sdraio" },
  { id: "0759", file: "IMG_0759.JPG", slug: "veranda-divanetto-blu" },
  { id: "0760", file: "IMG_0760.JPG", slug: "vialetto-giardino" },
  { id: "0761", file: "IMG_0761.JPG", slug: "camera-letto-matrimoniale" },
  { id: "0763", file: "IMG_0763.JPG", slug: "bagno-doccia" },
  { id: "0765", file: "IMG_0765.JPG", slug: "camera-mappa" },
  { id: "0767", file: "IMG_0767.JPG", slug: "camera-cappelli-paglia" },
  { id: "0768", file: "IMG_0768.JPG", slug: "camera-ferro-battuto" },
  { id: "0769", file: "IMG_0769.JPG", slug: "soggiorno-camino" },
  { id: "0770", file: "IMG_0770.JPG", slug: "tavolo-giardino" },
  { id: "0772", file: "IMG_0772.JPG", slug: "amaca-giardino" },
  { id: "0773", file: "IMG_0773.JPG", slug: "dettaglio-quadro-pesce" },
  { id: "0774", file: "IMG_0774.JPG", slug: "panca-bouganville" },
  { id: "0775", file: "IMG_0775.JPG", slug: "facciata-persiane-blu" },
] as const;

export type ImageId = (typeof imageCatalog)[number]["id"];

export const outputWidths = WIDTHS;

/** Widths to emit. Never larger than the source. A file under 640px is copied at its own width. */
export function outputWidthsFor(sourceWidth: number): number[] {
  const fitted = outputWidths.filter((width) => width <= sourceWidth);
  if (fitted.length > 0) return [...fitted];
  return [sourceWidth];
}

export const galleryGroups = {
  outside: ["0745", "0748", "0746", "0747", "0754", "0752", "0759", "0758", "0760", "0770", "0772", "0774", "0775"],
  inside: ["0761", "0765", "0768", "0767", "0769", "0756", "0757", "0763", "0773"],
  beach: ["0749"],
} as const satisfies Record<string, readonly ImageId[]>;

export type GalleryGroupId = keyof typeof galleryGroups;

type Variant = { width: number; path: string };

export type ManifestEntry = {
  width: number;
  height: number;
  avif: Variant[];
  webp: Variant[];
};

export type PhotoModel = {
  id: ImageId;
  width: number;
  height: number;
  src: string;
  avifSrcSet: string;
  webpSrcSet: string;
};

const stored = manifestFile as Record<string, unknown>;

export function catalogItem(id: ImageId): (typeof imageCatalog)[number] {
  const item = imageCatalog.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown photo ${id}`);
  return item;
}

export function fallbackEntry(id: ImageId): ManifestEntry {
  const { slug } = catalogItem(id);
  const path = `/images/${slug}-${FALLBACK_WIDTH}`;
  return {
    width: FALLBACK_WIDTH,
    height: FALLBACK_HEIGHT,
    avif: [{ width: FALLBACK_WIDTH, path: `${path}.avif` }],
    webp: [{ width: FALLBACK_WIDTH, path: `${path}.webp` }],
  };
}

function isVariant(value: unknown): value is Variant {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.width === "number" && typeof record.path === "string" && record.path.startsWith("/images/");
}

function isManifestEntry(value: unknown): value is ManifestEntry {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.width === "number" &&
    typeof record.height === "number" &&
    Array.isArray(record.avif) &&
    record.avif.length > 0 &&
    record.avif.every(isVariant) &&
    Array.isArray(record.webp) &&
    record.webp.length > 0 &&
    record.webp.every(isVariant)
  );
}

export function manifestEntry(id: ImageId): ManifestEntry {
  const value = stored[id];
  if (isManifestEntry(value)) return value;
  return fallbackEntry(id);
}

function srcSet(variants: readonly Variant[]): string {
  return variants.map((variant) => `${variant.path} ${variant.width}w`).join(", ");
}

export function photoModel(id: ImageId): PhotoModel {
  const entry = manifestEntry(id);
  const largest = entry.webp[entry.webp.length - 1] ?? fallbackEntry(id).webp[0];
  return {
    id,
    width: entry.width,
    height: entry.height,
    src: largest?.path ?? "",
    avifSrcSet: srcSet(entry.avif),
    webpSrcSet: srcSet(entry.webp),
  };
}
