import { describe, expect, it } from "vitest";
import { parseUGXPriceToMinor } from "../../src/utils/price.js";

describe("parseUGXPriceToMinor", () => {
  it("parses formatted UGX strings", () => {
    expect(parseUGXPriceToMinor("UGX 245,000")).toBe(245000);
    expect(parseUGXPriceToMinor("UGX 1,650,000")).toBe(1650000);
  });

  it("returns 0 for invalid values", () => {
    expect(parseUGXPriceToMinor("")).toBe(0);
    expect(parseUGXPriceToMinor("invalid")).toBe(0);
  });
});
