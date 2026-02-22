import { describe, expect, it } from "vitest";
import { mergeCartLineItems } from "../../src/modules/cart/cart.utils.js";

describe("mergeCartLineItems", () => {
  it("deduplicates by variant and sums quantities", () => {
    const merged = mergeCartLineItems(
      [
        { variantId: "v1", quantity: 1 },
        { variantId: "v2", quantity: 2 },
      ],
      [
        { variantId: "v2", quantity: 3 },
        { variantId: "v3", quantity: 1 },
      ],
    );

    expect(merged).toEqual(
      expect.arrayContaining([
        { variantId: "v1", quantity: 1 },
        { variantId: "v2", quantity: 5 },
        { variantId: "v3", quantity: 1 },
      ]),
    );
  });
});
