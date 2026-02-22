import { buildDressImportGroups, parseDressFilename, parsePriceMinor } from "../../src/utils/dress-import.js";

describe("dress filename parser", () => {
  it("parses K and M UGX price formats", () => {
    expect(parsePriceMinor("Adrianna papell, maroon size 12US 600k")).toBe(600000);
    expect(parsePriceMinor("Dresse the population, maroon size S 1.2M")).toBe(1200000);
  });

  it("parses multi-size filenames and descriptors", () => {
    const parsed = parseDressFilename("French connection, blue stripped sizes M and XL.  300K.jpeg");
    expect(parsed.brand).toBe("French Connection");
    expect(parsed.styleDescriptor).toBe("Printed");
    expect(parsed.color).toBe("Blue");
    expect(parsed.sizes).toEqual(["M", "XL"]);
    expect(parsed.priceMinor).toBe(300000);
    expect(parsed.confidence).toBe("high");
    expect(parsed.isAltImage).toBe(false);
  });

  it("detects alternate images and groups size variants", () => {
    const parsed = [
      parseDressFilename("Kasper, gold jacket. Size  4US. 650k.jpeg"),
      parseDressFilename("Kasper, gold jacket. Size  6US. 650k back.jpeg"),
    ];

    const groups = buildDressImportGroups(parsed);
    expect(groups).toHaveLength(1);
    expect(groups[0].styleDescriptor).toBe("Jacket Set");
    expect(groups[0].sizes.sort()).toEqual(["4US", "6US"]);
    expect(groups[0].imageUrls).toHaveLength(2);
    expect(groups[0].primaryImageUrl).toContain("650k.jpeg");
  });

  it("falls back color to Assorted when descriptor is only size tokens", () => {
    const parsed = parseDressFilename("Zara,checked size. S.  250K.jpeg");
    expect(parsed.color).toBe("Assorted");
  });
});
