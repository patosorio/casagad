import { Timestamp, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { FirestoreDataConverter } from "firebase-admin/firestore";
import { describe, expect, it } from "vitest";
import { firestoreDocuments } from "@/shared/collections";
import { bookingConverter } from "@/server/repositories/bookings";
import { paymentConverter } from "@/server/repositories/payments";
import { refundOpConverter } from "@/server/repositories/refund-ops";
import { guestRegistryConverter } from "@/server/repositories/guest-registry";
import { nightConverter } from "@/server/repositories/nights";
import { blockConverter } from "@/server/repositories/blocks";
import { externalEventConverter } from "@/server/repositories/external-events";
import { seasonConverter } from "@/server/repositories/seasons";
import {
  ratesMetaConverter,
  settingsPrivateConverter,
  settingsPublicConverter,
} from "@/server/repositories/settings";
import { publicCalendarConverter } from "@/server/repositories/public-calendar";
import { familyCalendarConverter } from "@/server/repositories/family-calendar";
import { messageConverter } from "@/server/repositories/messages";
import { userConverter } from "@/server/repositories/users";
import { auditEntryConverter } from "@/server/repositories/audit-log";
import { outboxConverter } from "@/server/repositories/outbox";
import { syncStateConverter } from "@/server/repositories/sync-state";
import { leaseConverter } from "@/server/repositories/leases";
import { stripeEventConverter } from "@/server/repositories/stripe-events";
import { counterConverter } from "@/server/repositories/counters";
import { rateLimitConverter } from "@/server/repositories/rate-limits";
import { occupancyConverter } from "@/server/repositories/occupancy";
import { firestoreConverters } from "@/server/repositories/registry";
import {
  auditEntrySchema,
  blockSchema,
  bookingSchema,
  counterSchema,
  externalEventSchema,
  familyCalendarSchema,
  guestRegistryEntrySchema,
  leaseSchema,
  messageSchema,
  nightSchema,
  occupancySchema,
  outboxItemSchema,
  paymentSchema,
  publicCalendarSchema,
  rateLimitSchema,
  ratesMetaSchema,
  refundOpSchema,
  seasonSchema,
  settingsPrivateSchema,
  settingsPublicSchema,
  stripeEventSchema,
  syncStateSchema,
  userSchema,
} from "@/shared/schemas";
import { modelSamples } from "./model-samples";

const now = new Date("2027-03-01T10:00:00.000Z");

describe("firestore converters", () => {
  it("registers a converter for every stored document", () => {
    expect(Object.keys(firestoreConverters).sort()).toEqual(firestoreDocuments.map((doc) => doc.key).sort());
  });

  it("round-trips every sample through timestamps", () => {
    const samples = modelSamples(now);
    const checks: Array<() => void> = [
      () => expectRoundTrip(userConverter, userSchema.parse(samples.users)),
      () => expectRoundTrip(bookingConverter, bookingSchema.parse(samples.bookings)),
      () => expectRoundTrip(paymentConverter, paymentSchema.parse(samples.payments)),
      () => expectRoundTrip(guestRegistryConverter, guestRegistryEntrySchema.parse(samples.guestRegistry)),
      () => expectRoundTrip(refundOpConverter, refundOpSchema.parse(samples.refundOps)),
      () => expectRoundTrip(nightConverter, nightSchema.parse(samples.nights)),
      () => expectRoundTrip(blockConverter, blockSchema.parse(samples.blocks)),
      () => expectRoundTrip(externalEventConverter, externalEventSchema.parse(samples.externalEvents)),
      () => expectRoundTrip(seasonConverter, seasonSchema.parse(samples.seasons)),
      () => expectRoundTrip(settingsPublicConverter, settingsPublicSchema.parse(samples.settingsPublic)),
      () => expectRoundTrip(settingsPrivateConverter, settingsPrivateSchema.parse(samples.settingsPrivate)),
      () => expectRoundTrip(ratesMetaConverter, ratesMetaSchema.parse(samples.ratesMeta)),
      () => expectRoundTrip(publicCalendarConverter, publicCalendarSchema.parse(samples.publicCalendar)),
      () => expectRoundTrip(familyCalendarConverter, familyCalendarSchema.parse(samples.familyCalendar)),
      () => expectRoundTrip(messageConverter, messageSchema.parse(samples.messages)),
      () => expectRoundTrip(counterConverter, counterSchema.parse(samples.counters)),
      () => expectRoundTrip(stripeEventConverter, stripeEventSchema.parse(samples.stripeEvents)),
      () => expectRoundTrip(rateLimitConverter, rateLimitSchema.parse(samples.rateLimits)),
      () => expectRoundTrip(auditEntryConverter, auditEntrySchema.parse(samples.auditLog)),
      () => expectRoundTrip(outboxConverter, outboxItemSchema.parse(samples.outbox)),
      () => expectRoundTrip(syncStateConverter, syncStateSchema.parse(samples.syncState)),
      () => expectRoundTrip(leaseConverter, leaseSchema.parse(samples.leases)),
      () => expectRoundTrip(occupancyConverter, occupancySchema.parse(samples.occupancy)),
    ];
    expect(checks).toHaveLength(firestoreDocuments.length);
    for (const check of checks) check();
  });

  it("writes a partial merge without requiring a full booking", () => {
    const stored = bookingConverter.toFirestore({ updatedAt: now }, { merge: true });
    expect(stored.updatedAt).toBeInstanceOf(Timestamp);
  });

  it("rejects a document that does not match the booking shape", () => {
    expect(() => bookingConverter.fromFirestore(snapshot({ status: "request" }))).toThrow();
  });
});

function expectRoundTrip<T>(converter: FirestoreDataConverter<T>, value: T): void {
  const stored = converter.toFirestore(value);
  expect(converter.fromFirestore(snapshot(stored))).toEqual(value);
}

function snapshot(data: unknown): QueryDocumentSnapshot {
  return {
    data() {
      return data;
    },
  } as QueryDocumentSnapshot;
}
