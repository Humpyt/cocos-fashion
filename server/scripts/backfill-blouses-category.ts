import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotEnv } from "dotenv";
import { prisma } from "../src/lib/prisma.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(currentDir, "..");

loadDotEnv({ path: resolve(serverDir, ".env") });

type BackfillSummary = {
  matchedProducts: number;
  createdCategory: boolean;
  linkedToBlousesCount: number;
  linkedToWomenCount: number;
};

const run = async (): Promise<BackfillSummary> => {
  const existingBlouses = await prisma.category.findUnique({
    where: { slug: "blouses" },
    select: { id: true },
  });

  const blousesCategory = await prisma.category.upsert({
    where: { slug: "blouses" },
    create: { slug: "blouses", name: "Blouses" },
    update: { name: "Blouses" },
  });

  const womenCategory = await prisma.category.upsert({
    where: { slug: "women" },
    create: { slug: "women", name: "Women" },
    update: { name: "Women" },
  });

  const blouseProducts = await prisma.product.findMany({
    where: {
      active: true,
      images: {
        some: {
          url: {
            startsWith: "/blouses/",
          },
        },
      },
    },
    select: { id: true },
  });

  const productIds = blouseProducts.map((product) => product.id);

  const linkedToBlouses =
    productIds.length > 0
      ? await prisma.productCategory.createMany({
          data: productIds.map((productId) => ({
            productId,
            categoryId: blousesCategory.id,
          })),
          skipDuplicates: true,
        })
      : { count: 0 };

  const linkedToWomen =
    productIds.length > 0
      ? await prisma.productCategory.createMany({
          data: productIds.map((productId) => ({
            productId,
            categoryId: womenCategory.id,
          })),
          skipDuplicates: true,
        })
      : { count: 0 };

  return {
    matchedProducts: productIds.length,
    createdCategory: !existingBlouses,
    linkedToBlousesCount: linkedToBlouses.count,
    linkedToWomenCount: linkedToWomen.count,
  };
};

run()
  .then(async (summary) => {
    // eslint-disable-next-line no-console
    console.log("Blouses category backfill completed.");
    // eslint-disable-next-line no-console
    console.log(`matchedProducts: ${summary.matchedProducts}`);
    // eslint-disable-next-line no-console
    console.log(`createdCategory: ${summary.createdCategory}`);
    // eslint-disable-next-line no-console
    console.log(`linkedToBlousesCount: ${summary.linkedToBlousesCount}`);
    // eslint-disable-next-line no-console
    console.log(`linkedToWomenCount: ${summary.linkedToWomenCount}`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to backfill blouses category:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
