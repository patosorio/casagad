import path from "node:path";
import { pathToFileURL } from "node:url";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { ZodError } from "zod";
import { addStayDays, rangeToNights } from "../shared/dates";
import {
  blockSchema,
  bookingSchema,
  nightSchema,
  occupancySchema,
  paymentSchema,
  ratesMetaSchema,
  refundOpSchema,
  seasonSchema,
  settingsPrivateSchema,
  settingsPublicSchema,
  userSchema,
  type BookingStatus,
} from "../shared/schemas";

const PLACEHOLDER_NIGHTLY_CENTS = 1;

type StayLock = "hold" | "booking" | null;

type Stay = {
  id: string;
  status: BookingStatus;
  ref: string;
  checkIn: string;
  checkOut: string;
  lock: StayLock;
};

const stays: readonly Stay[] = [
  { id: "seed-request", status: "request", ref: "CG-2027-0001", checkIn: "2027-04-01", checkOut: "2027-04-04", lock: null },
  { id: "seed-accepted", status: "accepted", ref: "CG-2027-0002", checkIn: "2027-04-10", checkOut: "2027-04-13", lock: "hold" },
  { id: "seed-confirmed", status: "confirmed", ref: "CG-2027-0003", checkIn: "2027-05-01", checkOut: "2027-05-04", lock: "booking" },
  { id: "seed-paid", status: "paid_in_full", ref: "CG-2027-0004", checkIn: "2027-05-10", checkOut: "2027-05-13", lock: "booking" },
  { id: "seed-completed", status: "completed", ref: "CG-2026-0001", checkIn: "2026-09-01", checkOut: "2026-09-04", lock: "booking" },
  { id: "seed-declined", status: "declined", ref: "CG-2027-0005", checkIn: "2027-06-01", checkOut: "2027-06-04", lock: null },
  { id: "seed-expired", status: "expired", ref: "CG-2027-0006", checkIn: "2027-06-10", checkOut: "2027-06-13", lock: null },
  { id: "seed-cancelled", status: "cancelled", ref: "CG-2027-0007", checkIn: "2027-07-01", checkOut: "2027-07-04", lock: null },
];

export type SeedWrite = { path: string; data: unknown };

/**
 * Refuses unless FIRESTORE_EMULATOR_HOST is the emulator host:port.
 * Returns that host. Does not connect.
 */
export function assertEmulatorOnly(
  env: { NODE_ENV?: NodeJS.ProcessEnv["NODE_ENV"]; FIRESTORE_EMULATOR_HOST?: string } = process.env,
): string {
  const host = env.FIRESTORE_EMULATOR_HOST?.trim() ?? "";
  if (host.length === 0) {
    throw new Error(
      "Refusing to seed: FIRESTORE_EMULATOR_HOST is not set. This script only runs against the Firestore emulator.",
    );
  }
  if (host.includes("googleapis.com") || host.includes("://") || !/^[^:\s]+:\d+$/.test(host)) {
    throw new Error(
      "Refusing to seed: FIRESTORE_EMULATOR_HOST must be the emulator host:port, not a production address.",
    );
  }
  return host;
}

/** Parsed documents only. Amounts are placeholders, not house rates. */
export function buildSeedDocuments(now: Date): SeedWrite[] {
  const writes: SeedWrite[] = [];
  const empty = { it: "" };

  writes.push(
    {
      path: "seasons/seed-low",
      data: seasonSchema.parse({
        name: { it: "Prova", en: "Sample" },
        from: "2027-01-01",
        to: "2027-06-01",
        nightlyCents: PLACEHOLDER_NIGHTLY_CENTS,
        minNights: 2,
        active: true,
      }),
    },
    {
      path: "seasons/seed-high",
      data: seasonSchema.parse({
        name: { it: "Prova alta", en: "Sample high" },
        from: "2027-06-01",
        to: "2027-10-01",
        nightlyCents: PLACEHOLDER_NIGHTLY_CENTS,
        minNights: 7,
        active: true,
      }),
    },
    {
      path: "settings/public",
      data: settingsPublicSchema.parse({
        depositPercent: 30,
        balanceDueDaysBeforeArrival: 14,
        cleaningFeeCents: 0,
        baseGuests: 2,
        maxGuests: 8,
        extraGuestFeeCents: 0,
        maxPets: 1,
        petFeeCents: 0,
        holdHours: 24,
        bookingWindowDays: 365,
        touristTax: {
          enabled: false,
          perPersonPerNightCents: null,
          maxNights: null,
          exemptUnderAge: null,
          months: [],
          note: empty,
        },
        houseDetails: {
          address: empty,
          checkInMethod: empty,
          cancellationPolicy: empty,
          season: empty,
          notice: empty,
        },
        cin: "",
      }),
    },
    {
      path: "settings/private",
      data: settingsPrivateSchema.parse({
        vrboSyncEnabled: false,
        notificationEmails: ["owner@example.com"],
      }),
    },
    {
      path: "settings/ratesMeta",
      data: ratesMetaSchema.parse({ version: 1, updatedAt: now }),
    },
    {
      path: "meta/occupancy",
      data: occupancySchema.parse({ version: 1 }),
    },
    {
      path: "users/seed-owner",
      data: userSchema.parse({
        email: "owner@example.com",
        displayName: "Proprietario",
        role: "owner",
        active: true,
        createdAt: now,
        updatedAt: now,
      }),
    },
    {
      path: "users/seed-family",
      data: userSchema.parse({
        email: "family@example.com",
        displayName: "Famiglia",
        role: "family",
        active: true,
        createdAt: now,
        updatedAt: now,
      }),
    },
  );

  for (const stay of stays) {
    const nights = rangeToNights(stay.checkIn, stay.checkOut);
    const totalCents = PLACEHOLDER_NIGHTLY_CENTS * nights.length;
    const holdExpiresAt = holdExpiry(stay.status, now);
    writes.push({
      path: `bookings/${stay.id}`,
      data: bookingSchema.parse({
        ref: stay.ref,
        status: stay.status,
        source: "direct",
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        nights: nights.length,
        party: { adults: 2, children: 0, pets: 0 },
        guest: {
          firstName: "Ospite",
          lastName: "Prova",
          email: `${stay.id}@example.com`,
          phone: "+390000000000",
          country: "IT",
          locale: "it",
        },
        ...(stay.status === "request" ? { guestMessage: "Messaggio di prova" } : {}),
        quote: {
          lines: [
            {
              kind: "nights",
              label: { it: "Notti", en: "Nights" },
              qty: nights.length,
              unitCents: PLACEHOLDER_NIGHTLY_CENTS,
              totalCents,
            },
          ],
          subtotalCents: totalCents,
          touristTaxCents: 0,
          totalCents,
          depositCents: PLACEHOLDER_NIGHTLY_CENTS,
          balanceCents: totalCents - PLACEHOLDER_NIGHTLY_CENTS,
          currency: "EUR",
          ratesVersion: 1,
        },
        depositCents: PLACEHOLDER_NIGHTLY_CENTS,
        balanceCents: totalCents - PLACEHOLDER_NIGHTLY_CENTS,
        balanceDueDate: addStayDays(stay.checkIn, -14),
        ...(holdExpiresAt ? { holdExpiresAt } : {}),
        holdGeneration: stay.status === "request" || stay.status === "declined" ? 0 : 1,
        checkoutAttempt: 0,
        ...(stay.status === "accepted" ? { stripeCheckoutSessionId: "seed-checkout-accepted" } : {}),
        checkoutPending: false,
        needsAttention: false,
        consent: { privacyVersion: "seed", acceptedAt: now },
        createdAt: now,
        updatedAt: now,
      }),
    });

    if (stay.lock !== null) {
      for (const date of nights) {
        writes.push({
          path: `nights/${date}`,
          data: nightSchema.parse({
            kind: stay.lock,
            refId: stay.id,
            generation: 1,
            ...(stay.lock === "hold" && holdExpiresAt ? { holdExpiresAt } : {}),
            createdAt: now,
          }),
        });
      }
    }
  }

  const blocks = [
    {
      id: "seed-block-family",
      from: "2027-08-01",
      to: "2027-08-08",
      reason: "family" as const,
      createdBy: "seed-family",
      note: "Prova",
    },
    {
      id: "seed-block-owner",
      from: "2027-12-24",
      to: "2027-12-27",
      reason: "owner" as const,
      createdBy: "seed-owner",
    },
  ];

  for (const { id, ...block } of blocks) {
    writes.push({
      path: `blocks/${id}`,
      data: blockSchema.parse(block),
    });
    for (const date of rangeToNights(block.from, block.to)) {
      writes.push({
        path: `nights/${date}`,
        data: nightSchema.parse({
          kind: "block",
          refId: id,
          generation: 0,
          createdAt: now,
        }),
      });
    }
  }

  writes.push(
    {
      path: "bookings/seed-confirmed/payments/seed-deposit",
      data: paymentSchema.parse({
        kind: "deposit",
        method: "stripe",
        amountCents: PLACEHOLDER_NIGHTLY_CENTS,
        touristTaxCents: 0,
        status: "paid",
        stripePaymentIntentId: "seed-pi-confirmed",
        livemode: false,
        paidAt: now,
        receiptNumber: "2027-0001",
        receiptPath: "receipts/2027/2027-0001.pdf",
      }),
    },
    {
      path: "bookings/seed-cancelled/refundOps/seed-refund",
      data: refundOpSchema.parse({
        amountCents: PLACEHOLDER_NIGHTLY_CENTS,
        status: "requested",
        actorUid: "seed-owner",
        createdAt: now,
        updatedAt: now,
      }),
    },
  );

  return writes;
}

async function main(): Promise<void> {
  let host: string;
  try {
    host = assertEmulatorOnly();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Refusing to seed.");
    process.exit(1);
  }

  try {
    const projectId = nonEmpty(process.env.GCLOUD_PROJECT) ?? "casagad-c1f81";
    initializeApp({ projectId });
    const writes = buildSeedDocuments(new Date());
    const db = getFirestore();
    const batch = db.batch();
    for (const write of writes) {
      batch.set(db.doc(write.path), encodeDocument(write.data));
    }
    await batch.commit();
    console.log(`Seeded the Firestore emulator at ${host} (${writes.length} documents).`);
  } catch (error) {
    console.error(seedFailure(error));
    process.exit(1);
  }
}

function holdExpiry(status: BookingStatus, now: Date): Date | undefined {
  if (status === "accepted") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (status === "expired") return new Date(now.getTime() - 60 * 60 * 1000);
  return undefined;
}

function seedFailure(error: unknown): string {
  if (error instanceof ZodError) {
    const paths = error.issues.map((issue) => issue.path.join(".") || "(root)");
    return `Seed data does not match the schema: ${paths.join(", ")}.`;
  }
  return "Seed failed.";
}

function encodeDocument(value: unknown): DocumentData {
  if (!isPlainRecord(value)) throw new Error("Seed document must be an object.");
  const document: DocumentData = {};
  for (const [key, inner] of Object.entries(value)) {
    if (inner === undefined) continue;
    document[key] = encodeField(inner);
  }
  return document;
}

function encodeField(value: unknown): unknown {
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (Array.isArray(value)) return value.map((item) => encodeField(item));
  if (isPlainRecord(value)) return encodeDocument(value);
  return value;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length === 0 ? undefined : trimmed;
}

function isDirectRun(): boolean {
  const candidates = [process.argv[1], process.argv[2]];
  for (const entry of candidates) {
    if (entry === undefined || entry.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (pathToFileURL(path.resolve(entry)).href === import.meta.url) return true;
  }
  return false;
}

if (isDirectRun()) {
  void main();
}
