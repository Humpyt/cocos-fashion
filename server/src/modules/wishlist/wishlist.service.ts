import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../utils/http.js";

export const getWishlist = async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    productId: item.productId,
    addedAt: item.createdAt,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      brand: item.product.brand,
      name: item.product.name,
      currency: item.product.currency,
      priceMinor: item.product.priceMinor,
      originalPriceMinor: item.product.originalPriceMinor,
      imageUrl: item.product.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null,
    },
  }));
};

export const addWishlistItem = async (userId: string, productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    notFound("Product not found");
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {},
    create: {
      userId,
      productId,
    },
  });

  return getWishlist(userId);
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
  return getWishlist(userId);
};

export const mergeWishlistItems = async (userId: string, productIds: string[]) => {
  const deduped = Array.from(new Set(productIds));
  if (!deduped.length) {
    return getWishlist(userId);
  }

  await prisma.wishlistItem.createMany({
    data: deduped.map((productId) => ({ userId, productId })),
    skipDuplicates: true,
  });

  return getWishlist(userId);
};
