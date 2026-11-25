import { describe, expect, it } from "vitest";
import { addStayDays, rangeToNights, StayDateError } from "@/shared/dates";

describe("Europe/Rome stay dates", () => {
  it("lists nights in [checkIn, checkOut) and omits the check-out date", () => {
    expect(rangeToNights("2027-07-01", "2027-07-04")).toEqual(["2027-07-01", "2027-07-02", "2027-07-03"]);
    expect(rangeToNights("2027-07-01", "2027-07-02")).toEqual(["2027-07-01"]);
    expect(rangeToNights("2027-07-01", "2027-07-01")).toEqual([]);
    expect(rangeToNights("2027-07-02", "2027-07-01")).toEqual([]);
  });

  it("keeps calendar days across the spring-forward and fall-back nights", () => {
    expect(rangeToNights("2026-03-28", "2026-03-31")).toEqual(["2026-03-28", "2026-03-29", "2026-03-30"]);
    expect(rangeToNights("2026-03-29", "2026-03-30")).toEqual(["2026-03-29"]);
    expect(rangeToNights("2026-10-24", "2026-10-27")).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(rangeToNights("2026-10-25", "2026-10-26")).toEqual(["2026-10-25"]);
  });

  it("includes the leap day and rejects a date that is not on the calendar", () => {
    expect(rangeToNights("2028-02-28", "2028-03-02")).toEqual(["2028-02-28", "2028-02-29", "2028-03-01"]);
    expect(addStayDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addStayDays("2026-10-24", 1)).toBe("2026-10-25");
    expect(() => rangeToNights("2026-02-31", "2026-03-02")).toThrow(StayDateError);
    expect(() => rangeToNights("1", "2026-03-02")).toThrow(StayDateError);
  });
});
