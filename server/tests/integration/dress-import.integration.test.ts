import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prisma } from "../../src/lib/prisma.js";
import { runDressImport } from "../../src/utils/dress-importer.js";

const maybeDescribe = process.env.RUN_DRESS_IMPORT_TESTS === "true" ? describe : describe.skip;

maybeDescribe("dress import integration", () => {
  let sourceDir = "";

  beforeAll(async () => {
    sourceDir = await mkdtemp(join(tmpdir(), "dress-import-"));
    await writeFile(join(sourceDir, "Kasper, gold jacket. Size  4US. 650k.jpeg"), "");
    await writeFile(join(sourceDir, "Kasper, gold jacket. Size  6US. 650k back.jpeg"), "");
    await writeFile(join(sourceDir, "Dkny ,green floral. Size 12US. 830k.jpeg"), "");
    await writeFile(join(sourceDir, "Zara,checked size. S.  250K.jpeg"), "");

    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    if (sourceDir) {
      await rm(sourceDir, { recursive: true, force: true });
    }
    await prisma.$disconnect();
  });

  it("imports and upserts grouped dress products idempotently", async () => {
    const firstRun = await runDressImport({
      sourceDir,
      dryRun: false,
    });

    expect(firstRun.summary.createdProducts).toBe(3);
    expect(firstRun.summary.createdVariants).toBeGreaterThanOrEqual(4);

    const dressesCategory = await prisma.category.findUnique({ where: { slug: "dresses" } });
    const womenCategory = await prisma.category.findUnique({ where: { slug: "women" } });
    const waistcoatsCategory = await prisma.category.findUnique({ where: { slug: "waistcoats" } });
    expect(dressesCategory).toBeTruthy();
    expect(womenCategory).toBeTruthy();
    expect(waistcoatsCategory).toBeTruthy();

    const groupedProduct = await prisma.product.findFirst({
      where: {
        brand: "Kasper",
      },
      include: {
        images: true,
        variants: true,
        categoryLinks: true,
      },
    });
    expect(groupedProduct).toBeTruthy();
    expect(groupedProduct?.images.length).toBe(2);
    expect(groupedProduct?.variants.map((variant) => variant.size).sort()).toEqual(["4US", "6US"]);
    expect(groupedProduct?.categoryLinks.length).toBeGreaterThanOrEqual(2);

    const waistcoatProduct = await prisma.product.findUnique({
      where: { slug: "zara-checked-assorted-250000" },
      include: {
        categoryLinks: {
          include: {
            category: true,
          },
        },
      },
    });
    expect(waistcoatProduct).toBeTruthy();
    const waistcoatCategorySlugs = (waistcoatProduct?.categoryLinks ?? [])
      .map((categoryLink) => categoryLink.category.slug)
      .sort();
    expect(waistcoatCategorySlugs).toEqual(["waistcoats", "women"]);

    const secondRun = await runDressImport({
      sourceDir,
      dryRun: false,
    });
    expect(secondRun.summary.createdProducts).toBe(0);
    expect(secondRun.summary.updatedProducts).toBe(3);
  });
});
