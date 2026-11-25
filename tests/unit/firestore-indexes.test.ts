import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("firestore indexes and rules files", () => {
  it("indexes the admin, hold, attention, and outbox queries", () => {
    const file = parse(readFileSync(join(root, "firestore.indexes.json"), "utf8"));
    const indexes = arrayOf(file.indexes);
    expect(hasIndex(indexes, "bookings", ["status", "checkIn"])).toBe(true);
    expect(hasIndex(indexes, "bookings", ["checkIn", "checkOut"])).toBe(true);
    expect(hasIndex(indexes, "bookings", ["status", "holdExpiresAt"])).toBe(true);
    expect(hasIndex(indexes, "bookings", ["needsAttention", "updatedAt"])).toBe(true);
    expect(hasIndex(indexes, "messages", ["status", "createdAt"])).toBe(true);
    expect(hasIndex(indexes, "outbox", ["status", "nextAttemptAt"])).toBe(true);

    const overrides = arrayOf(file.fieldOverrides);
    expect(exempt(overrides, "bookings", "guestMessage")).toBe(true);
    expect(exempt(overrides, "messages", "body")).toBe(true);
    expect(indexesField(overrides, "blocks", "from")).toBe(true);
    expect(indexesField(overrides, "payments", "paidAt", "COLLECTION_GROUP")).toBe(true);
  });

  it("denies every client in the rules files", () => {
    const firestore = readFileSync(join(root, "firestore.rules"), "utf8");
    const storage = readFileSync(join(root, "storage.rules"), "utf8");
    for (const rules of [firestore, storage]) {
      expect(rules).toContain("if false");
      expect(rules).toContain("All access is server-side");
    }
  });
});

function hasIndex(indexes: unknown[], group: string, fields: string[]): boolean {
  return indexes.some((index) => {
    if (!isRecord(index) || index.collectionGroup !== group) return false;
    const listed = arrayOf(index.fields).map((field) => (isRecord(field) ? field.fieldPath : undefined));
    return listed.join(",") === fields.join(",");
  });
}

function exempt(overrides: unknown[], group: string, fieldPath: string): boolean {
  return overrides.some((override) => {
    if (!isRecord(override)) return false;
    return override.collectionGroup === group && override.fieldPath === fieldPath && Array.isArray(override.indexes) && override.indexes.length === 0;
  });
}

function indexesField(overrides: unknown[], group: string, fieldPath: string, scope?: string): boolean {
  return overrides.some((override) => {
    if (!isRecord(override) || override.collectionGroup !== group || override.fieldPath !== fieldPath) return false;
    const indexes = arrayOf(override.indexes);
    if (scope === undefined) return indexes.length > 0;
    return indexes.some((index) => isRecord(index) && index.queryScope === scope);
  });
}

function parse(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value)) throw new Error("Expected a JSON object.");
  return value;
}

function arrayOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
