import "server-only";

import type { BookingStatus } from "@/shared/schemas/booking";

export const allowedTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  request: ["accepted", "declined"],
  accepted: ["confirmed", "expired", "cancelled"],
  confirmed: ["paid_in_full", "cancelled"],
  paid_in_full: ["completed", "cancelled"],
  completed: [],
  declined: [],
  expired: [],
  cancelled: [],
};

export class BookingTransitionError extends Error {
  readonly appCode = "WRONG_STATUS" as const;
  readonly from: BookingStatus;
  readonly to: BookingStatus;

  constructor(from: BookingStatus, to: BookingStatus) {
    super(`Cannot change booking status from ${from} to ${to}.`);
    this.name = "BookingTransitionError";
    this.from = from;
    this.to = to;
  }
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  const allowed = allowedTransitions[from];
  if (allowed === undefined || !allowed.includes(to)) {
    throw new BookingTransitionError(from, to);
  }
}
