import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prisma } from "../../src/lib/prisma.js";
import { runShoeImport } from "../../src/utils/shoe-importer.js";

const maybeDescribe = process.env.RUN_SHOE_IMPORT_TESTS === "true" ? describe : describe.skip;

maybeDescribe("ladies shoes import integration", () => {
  let sourceDir = "";

  beforeAll(async () => {
    sourceDir = await mkdtemp(join(tmpdir(), "shoe-import-"));
    await writeFile(join(sourceDir, "ALDO, multi size. 10M US. 400k (1).jpeg"), "");
    await writeFile(join(sourceDir, "ALDO, multi size. 10M US. 400k (2).jpeg"), "");
    await writeFile(join(sourceDir, "MNG, BLACK, SIZES 39 & 40. 325K.jpeg"), "");
    await writeFile(join(sourceDir, "Clarks, snake print. Size 6D UK. 300k.jpeg"), "");

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

  it("imports and upserts grouped ladies shoe products idempotently", async () => {
    const firstRun = await runShoeImport({
      sourceDir,
      dryRun: false,
    });

    expect(firstRun.summary.createdProducts).toBe(3);
    expect(firstRun.summary.createdVariants).toBeGreaterThanOrEqual(4);

    const shoesCategory = await prisma.category.findUnique({ where: { slug: "shoes" } });
    const womenCategory = await prisma.category.findUnique({ where: { slug: "women" } });
    expect(shoesCategory).toBeTruthy();
    expect(womenCategory).toBeTruthy();

    const aldoProduct = await prisma.product.findFirst({
      where: {
        brand: "ALDO",
      },
      include: {
        images: true,
        variants: true,
        categoryLinks: {
          include: {
            category: true,
          },
        },
      },
    });

    expect(aldoProduct).toBeTruthy();
    expect(aldoProduct?.images.length).toBe(2);
    expect(aldoProduct?.variants.map((variant) => variant.size).sort()).toEqual(["10MUS"]);
    const aldoCategorySlugs = (aldoProduct?.categoryLinks ?? [])
      .map((categoryLink) => categoryLink.category.slug)
      .sort();
    expect(aldoCategorySlugs).toEqual(["shoes", "women"]);

    const secondRun = await runShoeImport({
      sourceDir,
      dryRun: false,
    });
    expect(secondRun.summary.createdProducts).toBe(0);
    expect(secondRun.summary.updatedProducts).toBe(3);
  });
});
