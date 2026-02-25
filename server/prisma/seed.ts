import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import blouseProducts from "./blouse-products.json";

const prisma = new PrismaClient();
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@cocos.local";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin123!@#";
const DEFAULT_ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME ?? "Admin";
const DEFAULT_ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME ?? "User";

const parseUGXPriceToMinor = (value: string): number => {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number.parseInt(digits, 10) : 0;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const categorySeeds = [
  { slug: "women", name: "Women" },
  { slug: "blouses", name: "Blouses" },
  { slug: "men", name: "Men" },
  { slug: "shoes", name: "Shoes" },
  { slug: "handbags", name: "Handbags" },
  { slug: "jewelry", name: "Jewelry" },
  { slug: "fragrance", name: "Fragrance" },
  { slug: "watches", name: "Watches" },
  { slug: "home", name: "Home" },
  { slug: "activewear", name: "Activewear" },
  { slug: "gifts", name: "Gift Sets" },
  { slug: "waistcoats", name: "Waistcoats" },
];

type BlouseSeed = {
  filename: string;
  brand: string;
  product: string;
  color: string;
  size: string;
  price: string;
  description: string;
};

const run = async () => {
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

  for (const category of categorySeeds) {
    await prisma.category.create({ data: category });
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const usedSlugs = new Set<string>();

  for (const [index, item] of (blouseProducts as BlouseSeed[]).entries()) {
    const name = `${item.brand} ${item.product}`;
    const baseSlug = slugify(`${item.brand}-${item.product}-${item.color}-${item.size}`);
    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    const product = await prisma.product.create({
      data: {
        slug,
        brand: item.brand,
        name,
        description: item.description,
        details: {
          color: item.color,
          size: item.size,
        },
        priceMinor: parseUGXPriceToMinor(item.price),
        originalPriceMinor: null,
        currency: "UGX",
        rating: 4.2 + (index % 7) * 0.1,
        reviewsCount: 12 + index * 7,
        badge: "REAL PRODUCT",
        isNew: true,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `/blouses/${encodeURIComponent(item.filename)}`,
        sortOrder: 0,
      },
    });

    await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `SKU-${slug.toUpperCase()}-${item.size.replace(/\s+/g, "-")}`,
        size: item.size,
        colorName: item.color,
        stockQty: 100,
      },
    });

    const womenCategoryId = categoryBySlug.get("women");
    if (!womenCategoryId) {
      throw new Error("Women category missing during seed");
    }
    const blousesCategoryId = categoryBySlug.get("blouses");
    if (!blousesCategoryId) {
      throw new Error("Blouses category missing during seed");
    }
    await prisma.productCategory.createMany({
      data: [
        {
          categoryId: womenCategoryId,
          productId: product.id,
        },
        {
          categoryId: blousesCategoryId,
          productId: product.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  const passwordHash = await argon2.hash(DEFAULT_ADMIN_PASSWORD);
  const adminUser = await prisma.user.upsert({
    where: {
      email: DEFAULT_ADMIN_EMAIL,
    },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      firstName: DEFAULT_ADMIN_FIRST_NAME,
      lastName: DEFAULT_ADMIN_LAST_NAME,
      role: "ADMIN",
      rewardTier: "PLATINUM",
      rewardPoints: 50000,
      nextTierPoints: 50000,
    },
    update: {
      firstName: DEFAULT_ADMIN_FIRST_NAME,
      lastName: DEFAULT_ADMIN_LAST_NAME,
      role: "ADMIN",
    },
  });

  const existingActiveCart = await prisma.cart.findFirst({
    where: {
      userId: adminUser.id,
      status: "ACTIVE",
    },
  });
  if (!existingActiveCart) {
    await prisma.cart.create({
      data: {
        userId: adminUser.id,
        status: "ACTIVE",
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Admin user ready: ${DEFAULT_ADMIN_EMAIL}`);
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
