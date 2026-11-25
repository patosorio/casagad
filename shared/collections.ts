/** Every stored document the rules tests deny. Keys match server/repositories/registry.ts. */
export const firestoreDocuments = [
  { key: "users", path: "users/user-1" },
  { key: "bookings", path: "bookings/booking-1" },
  { key: "payments", path: "bookings/booking-1/payments/pay-1" },
  { key: "guestRegistry", path: "bookings/booking-1/guestRegistry/guest-1" },
  { key: "refundOps", path: "bookings/booking-1/refundOps/refund-1" },
  { key: "nights", path: "nights/2027-07-01" },
  { key: "blocks", path: "blocks/block-1" },
  { key: "externalEvents", path: "externalEvents/event-1" },
  { key: "seasons", path: "seasons/season-1" },
  { key: "settingsPublic", path: "settings/public" },
  { key: "settingsPrivate", path: "settings/private" },
  { key: "ratesMeta", path: "settings/ratesMeta" },
  { key: "publicCalendar", path: "public/calendar" },
  { key: "familyCalendar", path: "familyCalendar/current" },
  { key: "messages", path: "messages/message-1" },
  { key: "counters", path: "counters/bookingRef-2027" },
  { key: "stripeEvents", path: "stripeEvents/evt-1" },
  { key: "rateLimits", path: "rateLimits/key-1" },
  { key: "auditLog", path: "auditLog/audit-1" },
  { key: "outbox", path: "outbox/op-1" },
  { key: "syncState", path: "syncState/vrbo" },
  { key: "leases", path: "leases/vrboImport" },
  { key: "occupancy", path: "meta/occupancy" },
] as const;

export type FirestoreModelKey = (typeof firestoreDocuments)[number]["key"];
