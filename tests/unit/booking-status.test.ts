import { describe, expect, it } from "vitest";
import { bookingStatuses, type BookingStatus } from "@/shared/schemas/booking";
import { allowedTransitions, assertTransition, BookingTransitionError } from "@/server/domain/booking-status";

describe("booking status transitions", () => {
  it("names every status in the table", () => {
    expect(Object.keys(allowedTransitions).sort()).toEqual([...bookingStatuses].sort());
  });

  it("allows only the transitions in the table", () => {
    for (const from of bookingStatuses) {
      for (const to of bookingStatuses) {
        const allowed = allowedTransitions[from]?.includes(to) ?? false;
        if (allowed) {
          expect(() => assertTransition(from, to)).not.toThrow();
        } else {
          expect(() => assertTransition(from, to)).toThrow(BookingTransitionError);
          try {
            assertTransition(from, to);
          } catch (error) {
            expect(error).toBeInstanceOf(BookingTransitionError);
            if (error instanceof BookingTransitionError) {
              expect(error.appCode).toBe("WRONG_STATUS");
              expect(error.from).toBe(from);
              expect(error.to).toBe(to);
            }
          }
        }
      }
    }
  });

  it("follows the main path and the side exits", () => {
    const main: Array<[BookingStatus, BookingStatus]> = [
      ["request", "accepted"],
      ["accepted", "confirmed"],
      ["confirmed", "paid_in_full"],
      ["paid_in_full", "completed"],
    ];
    for (const [from, to] of main) assertTransition(from, to);

    assertTransition("request", "declined");
    assertTransition("accepted", "expired");
    assertTransition("accepted", "cancelled");
    assertTransition("confirmed", "cancelled");
    assertTransition("paid_in_full", "cancelled");

    expect(() => assertTransition("request", "confirmed")).toThrow(BookingTransitionError);
    expect(() => assertTransition("confirmed", "completed")).toThrow(BookingTransitionError);
    expect(() => assertTransition("declined", "accepted")).toThrow(BookingTransitionError);
    expect(() => assertTransition("completed", "cancelled")).toThrow(BookingTransitionError);
  });
});
