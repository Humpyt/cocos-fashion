import type { DressImportGroup } from "../../src/utils/dress-import.js";
import { resolveDressImportCategorySlugs } from "../../src/utils/dress-importer.js";

const buildGroup = (sourceFilenames: string[]): DressImportGroup => ({
  key: "sample-group",
  slug: "sample-group",
  brand: "Sample Brand",
  styleDescriptor: "Dress",
  color: "Sample",
  priceMinor: 100000,
  sizes: ["S"],
  imageUrls: ["/dresses/sample.jpeg"],
  primaryImageUrl: "/dresses/sample.jpeg",
  sourceFilenames,
  confidence: "high",
  warnings: [],
});

describe("dress importer category rules", () => {
  it("routes Zara checked size S 250K filename to women and waistcoats", () => {
    const categories = resolveDressImportCategorySlugs(
      buildGroup(["Zara,checked size. S.  250K.jpeg"]),
    );
    expect(categories).toEqual(["women", "waistcoats"]);
  });

  it("keeps default women and dresses categories for all other files", () => {
    const categories = resolveDressImportCategorySlugs(
      buildGroup(["Kasper, gold jacket. Size  4US. 650k.jpeg"]),
    );
    expect(categories).toEqual(["women", "dresses"]);
  });
});
