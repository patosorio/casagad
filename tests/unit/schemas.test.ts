import { describe, expect, it } from "vitest";
import { bookingSchema, bookingStatuses, guestRegistryEntrySchema, settingsPublicSchema } from "@/shared/schemas";
import { modelSamples } from "./model-samples";

const now = new Date("2027-03-01T10:00:00.000Z");

describe("document schemas", () => {
  it("parses a sample of every stored document", () => {
    expect(() => modelSamples(now)).not.toThrow();
  });

  it("accepts every booking status and rejects an unknown one", () => {
    const booking = modelSamples(now).bookings;
    if (!isRecord(booking)) throw new Error("Expected a booking sample.");
    for (const status of bookingStatuses) {
      expect(bookingSchema.safeParse({ ...booking, status }).success).toBe(true);
    }
    expect(bookingSchema.safeParse({ ...booking, status: "hold" }).success).toBe(false);
  });

  it("requires nights to match the exclusive stay range", () => {
    const booking = modelSamples(now).bookings;
    if (!isRecord(booking)) throw new Error("Expected a booking sample.");
    expect(bookingSchema.safeParse({ ...booking, nights: 1 }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...booking, checkOut: booking.checkIn }).success).toBe(false);
  });

  it("rejects an unknown field", () => {
    const booking = modelSamples(now).bookings;
    if (!isRecord(booking)) throw new Error("Expected a booking sample.");
    expect(bookingSchema.safeParse({ ...booking, renamed: true }).success).toBe(false);
  });

  it("keeps hold hours in 1–24 and the booking window positive", () => {
    const settings = modelSamples(now).settingsPublic;
    if (!isRecord(settings)) throw new Error("Expected settings.");
    expect(settingsPublicSchema.safeParse({ ...settings, holdHours: 1 }).success).toBe(true);
    expect(settingsPublicSchema.safeParse({ ...settings, holdHours: 24 }).success).toBe(true);
    expect(settingsPublicSchema.safeParse({ ...settings, holdHours: 0 }).success).toBe(false);
    expect(settingsPublicSchema.safeParse({ ...settings, holdHours: 25 }).success).toBe(false);
    expect(settingsPublicSchema.safeParse({ ...settings, bookingWindowDays: 0 }).success).toBe(false);
    expect(settingsPublicSchema.safeParse({ ...settings, depositPercent: 0 }).success).toBe(false);
    expect(settingsPublicSchema.safeParse({ ...settings, depositPercent: 101 }).success).toBe(false);
  });

  it("rejects a quote that is not EUR or whose rates version is not an integer", () => {
    const booking = modelSamples(now).bookings;
    if (!isRecord(booking) || !isRecord(booking.quote)) throw new Error("Expected a quote.");
    expect(bookingSchema.safeParse({ ...booking, quote: { ...booking.quote, currency: "USD" } }).success).toBe(
      false,
    );
    expect(
      bookingSchema.safeParse({ ...booking, quote: { ...booking.quote, ratesVersion: "1" } }).success,
    ).toBe(false);
  });

  it("accepts an active guest registry entry and rejects personal data on a purged one", () => {
    const active = guestRegistryEntrySchema.safeParse({
      role: "head",
      surname: "Prova",
      givenName: "Ospite",
      sex: "M",
      birthDate: "1990-01-01",
      birthPlace: "Roma",
      citizenship: "IT",
      docType: "carta",
      docNumber: "PROVA",
      docIssuedPlace: "Roma",
      submittedAt: now,
      exportedAt: now,
      purgeAfter: now,
    });
    expect(active.success).toBe(true);
    if (active.success) expect("surname" in active.data).toBe(true);

    const purgedWithName = guestRegistryEntrySchema.safeParse({
      role: "head",
      surname: "Prova",
      purgedAt: now,
    });
    expect(purgedWithName.success).toBe(false);
  });

  it("accepts a purged guest registry entry with no personal fields", () => {
    const purged = guestRegistryEntrySchema.safeParse({
      role: "member",
      purgedAt: now,
      submittedAt: now,
      exportedAt: now,
    });
    expect(purged.success).toBe(true);
    if (purged.success) {
      expect(purged.data).toEqual({
        role: "member",
        purgedAt: now,
        submittedAt: now,
        exportedAt: now,
      });
      expect("surname" in purged.data).toBe(false);
    }
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
