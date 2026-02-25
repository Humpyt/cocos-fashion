import { buildShoeImportGroups, extractSizes, parsePriceMinor, parseShoeFilename } from "../../src/utils/shoe-import.js";

describe("shoe filename parser", () => {
  it("parses K and M UGX price formats", () => {
    expect(parsePriceMinor("Aldo ,gold size 8.5 US. 350k")).toBe(350000);
    expect(parsePriceMinor("Luxury pair 1.2M")).toBe(1200000);
    expect(parsePriceMinor("ALDO, multi size. 10M US. 400k")).toBe(400000);
  });

  it("extracts multi-size UK shoe variants", () => {
    expect(extractSizes("CLARKS  black Sizes 5D,6D&7D UK. 300k")).toEqual(["5DUK", "6DUK", "7DUK"]);
  });

  it("parses single size when size keyword is missing", () => {
    const parsed = parseShoeFilename("Ralph lauren, brown 8B. Us. 400k.jpeg");
    expect(parsed.brand).toBe("Ralph Lauren");
    expect(parsed.priceMinor).toBe(400000);
    expect(parsed.sizes).toContain("8BUS");
  });

  it("groups duplicate image copies by normalized name and price", () => {
    const parsed = [
      parseShoeFilename("ALDO, multi size. 10M US. 400k (1).jpeg"),
      parseShoeFilename("ALDO, multi size. 10M US. 400k (2).jpeg"),
    ];

    const groups = buildShoeImportGroups(parsed);
    expect(groups).toHaveLength(1);
    expect(groups[0].imageUrls).toHaveLength(2);
    expect(groups[0].sizes).toEqual(["10MUS"]);
    expect(groups[0].priceMinor).toBe(400000);
  });

  it("separates groups when normalized name matches but price differs", () => {
    const parsed = [
      parseShoeFilename("Nine west, nude. Size 7M uk. 300k (1).jpeg"),
      parseShoeFilename("Nine west, nude. Size 7M uk. 350k (1).jpeg"),
    ];

    const groups = buildShoeImportGroups(parsed);
    expect(groups).toHaveLength(2);
  });
});
