import { describe, expect, it } from "vitest";
import { calculateOrderTotals } from "../../src/utils/order.js";

describe("calculateOrderTotals", () => {
  it("calculates subtotal, tax, and total", () => {
    const totals = calculateOrderTotals(
      [
        { priceMinor: 100000, quantity: 2 },
        { priceMinor: 45000, quantity: 1 },
      ],
      0.05,
      0,
    );

    expect(totals.subtotalMinor).toBe(245000);
    expect(totals.taxMinor).toBe(12250);
    expect(totals.totalMinor).toBe(257250);
  });
});
