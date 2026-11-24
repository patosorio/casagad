import { describe, expect, it } from "vitest";
import { CHECK_OUT_EXCLUSIVE, CURRENCY, STAY_TIMEZONE } from "@/shared";

describe("scaffold invariants", () => {
  it("keeps money in EUR", () => {
    expect(CURRENCY).toBe("EUR");
  });

  it("keeps stays in Europe/Rome with an exclusive check-out", () => {
    expect(STAY_TIMEZONE).toBe("Europe/Rome");
    expect(CHECK_OUT_EXCLUSIVE).toBe(true);
  });
});
