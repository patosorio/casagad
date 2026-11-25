import "server-only";

import { auditEntryConverter } from "./audit-log";
import { blockConverter } from "./blocks";
import { bookingConverter } from "./bookings";
import { counterConverter } from "./counters";
import { externalEventConverter } from "./external-events";
import { familyCalendarConverter } from "./family-calendar";
import { guestRegistryConverter } from "./guest-registry";
import { leaseConverter } from "./leases";
import { messageConverter } from "./messages";
import { nightConverter } from "./nights";
import { occupancyConverter } from "./occupancy";
import { outboxConverter } from "./outbox";
import { paymentConverter } from "./payments";
import { publicCalendarConverter } from "./public-calendar";
import { rateLimitConverter } from "./rate-limits";
import { refundOpConverter } from "./refund-ops";
import { seasonConverter } from "./seasons";
import { ratesMetaConverter, settingsPrivateConverter, settingsPublicConverter } from "./settings";
import { stripeEventConverter } from "./stripe-events";
import { syncStateConverter } from "./sync-state";
import { userConverter } from "./users";

export const firestoreConverters = {
  users: userConverter,
  bookings: bookingConverter,
  payments: paymentConverter,
  guestRegistry: guestRegistryConverter,
  refundOps: refundOpConverter,
  nights: nightConverter,
  blocks: blockConverter,
  externalEvents: externalEventConverter,
  seasons: seasonConverter,
  settingsPublic: settingsPublicConverter,
  settingsPrivate: settingsPrivateConverter,
  ratesMeta: ratesMetaConverter,
  publicCalendar: publicCalendarConverter,
  familyCalendar: familyCalendarConverter,
  messages: messageConverter,
  counters: counterConverter,
  stripeEvents: stripeEventConverter,
  rateLimits: rateLimitConverter,
  auditLog: auditEntryConverter,
  outbox: outboxConverter,
  syncState: syncStateConverter,
  leases: leaseConverter,
  occupancy: occupancyConverter,
};
