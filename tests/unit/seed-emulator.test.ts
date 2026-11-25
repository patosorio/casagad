import { describe, expect, it } from "vitest";
import { bookingStatuses } from "@/shared/schemas/booking";
import { assertEmulatorOnly, buildSeedDocuments } from "@/scripts/seed-emulator";

const now = new Date("2027-03-01T10:00:00.000Z");

describe("emulator seed", () => {
  it("refuses to run without the emulator host", () => {
    expect(() => assertEmulatorOnly({})).toThrow(/FIRESTORE_EMULATOR_HOST is not set/);
    expect(() => assertEmulatorOnly({ FIRESTORE_EMULATOR_HOST: " " })).toThrow(/FIRESTORE_EMULATOR_HOST is not set/);
    expect(() => assertEmulatorOnly({ FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443" })).toThrow(
      /not a production address/,
    );
    expect(() => assertEmulatorOnly({ FIRESTORE_EMULATOR_HOST: "https://127.0.0.1:8080" })).toThrow(
      /not a production address/,
    );
    expect(assertEmulatorOnly({ FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080" })).toBe("127.0.0.1:8080");
  });

  it("builds a booking in each status with placeholder amounts", () => {
    const docs = buildSeedDocuments(now);
    const bookings = docs.filter((doc) => /^bookings\/[^/]+$/.test(doc.path));
    const statuses = bookings.map((doc) => {
      if (!isRecord(doc.data)) throw new Error("Expected a booking.");
      return doc.data.status;
    });
    expect(statuses.sort()).toEqual([...bookingStatuses].sort());

    const nightPaths = docs.filter((doc) => doc.path.startsWith("nights/")).map((doc) => doc.path);
    expect(new Set(nightPaths).size).toBe(nightPaths.length);

    for (const doc of docs) {
      if (!isRecord(doc.data)) continue;
      if (typeof doc.data.nightlyCents === "number") expect(doc.data.nightlyCents).toBe(1);
      if (typeof doc.data.cleaningFeeCents === "number") expect(doc.data.cleaningFeeCents).toBe(0);
      if (typeof doc.data.email === "string") expect(doc.data.email.endsWith("@example.com")).toBe(true);
      const guest = doc.data.guest;
      if (isRecord(guest) && typeof guest.email === "string") {
        expect(guest.email.endsWith("@example.com")).toBe(true);
      }
    }

    expect(docs.some((doc) => doc.path === "users/seed-owner")).toBe(true);
    expect(docs.some((doc) => doc.path === "users/seed-family")).toBe(true);
    expect(docs.some((doc) => doc.path.startsWith("blocks/"))).toBe(true);
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
