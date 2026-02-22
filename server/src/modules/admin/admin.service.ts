import { Prisma } from "@prisma/client";
import type { OrderStatus, RewardTier, UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../utils/http.js";
import { slugify } from "../../utils/slug.js";
import { serializeProduct } from "../catalog/catalog.serializer.js";

const productInclude = {
  images: true,
  variants: true,
  categoryLinks: {
    include: {
      category: true,
    },
  },
} satisfies Prisma.ProductInclude;

const orderInclude = {
  user: true,
  address: true,
  payment: true,
  items: {
    include: {
      product: {
        include: {
          images: true,
        },
      },
      variant: true,
    },
  },
} satisfies Prisma.OrderInclude;

const createUniqueSlug = async (candidate: string, checker: (slug: string) => Promise<boolean>) => {
  let slug = slugify(candidate);
  if (!slug) {
    slug = `item-${Date.now()}`;
  }

  let suffix = 2;
  // Keep incrementing until a unique slug is found.
  while (await checker(slug)) {
    slug = `${slugify(candidate)}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const serializeAdminOrder = (order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  currency: order.currency,
  subtotalMinor: order.subtotalMinor,
  taxMinor: order.taxMinor,
  shippingMinor: order.shippingMinor,
  totalMinor: order.totalMinor,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  user: order.user
    ? {
        id: order.user.id,
        email: order.user.email,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
      }
    : null,
  address: order.address
    ? {
        firstName: order.address.firstName,
        lastName: order.address.lastName,
        line1: order.address.line1,
        city: order.address.city,
        phone: order.address.phone,
      }
    : null,
  payment: order.payment
    ? {
        method: order.payment.method,
        status: order.payment.status,
        providerRef: order.payment.providerRef,
      }
    : null,
  items: order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    productBrand: item.productBrand,
    unitPriceMinor: item.unitPriceMinor,
    quantity: item.quantity,
    lineTotalMinor: item.lineTotalMinor,
    imageUrl: item.product.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null,
    variantSku: item.variant?.sku ?? null,
  })),
});

export const getAdminOverview = async () => {
  const [totalUsers, totalProducts, totalOrders, revenueAggregate, pendingOrders, lowStockProducts] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalMinor: true },
      }),
      prisma.order.count({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.productVariant.count({
        where: {
          stockQty: {
            lte: 5,
          },
        },
      }),
    ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenueMinor: revenueAggregate._sum.totalMinor ?? 0,
    pendingOrders,
    lowStockProducts,
  };
};

export const listAdminUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    rewardTier: user.rewardTier,
    rewardPoints: user.rewardPoints,
    nextTierPoints: user.nextTierPoints,
    ordersCount: user._count.orders,
    createdAt: user.createdAt,
  }));
};

export const updateAdminUserRole = async (userId: string, role: UserRole) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  }).catch(() => notFound("User not found"));

  return {
    id: updated.id,
    role: updated.role,
  };
};

export const updateAdminUserRewards = async (
  userId: string,
  input: {
    rewardTier?: RewardTier;
    rewardPoints?: number;
    nextTierPoints?: number;
  },
) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      rewardTier: input.rewardTier,
      rewardPoints: input.rewardPoints,
      nextTierPoints: input.nextTierPoints,
    },
  }).catch(() => notFound("User not found"));

  return {
    id: updated.id,
    rewardTier: updated.rewardTier,
    rewardPoints: updated.rewardPoints,
    nextTierPoints: updated.nextTierPoints,
  };
};

export const listAdminCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          productLinks: true,
        },
      },
    },
  });
  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    productsCount: category._count.productLinks,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));
};

export const createAdminCategory = async (input: { name: string; slug?: string }) => {
  const slug = await createUniqueSlug(input.slug ?? input.name, async (candidate) => {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
    },
  });
};

export const updateAdminCategory = async (
  categoryId: string,
  input: { name?: string; slug?: string },
) => {
  const existing = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!existing) {
    notFound("Category not found");
  }

  let slug = input.slug;
  if (slug) {
    const normalized = slugify(slug);
    const duplicate = await prisma.category.findFirst({
      where: {
        slug: normalized,
        id: { not: categoryId },
      },
    });
    if (duplicate) {
      badRequest("Category slug already exists");
    }
    slug = normalized;
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name,
      slug,
    },
  });
};

export const deleteAdminCategory = async (categoryId: string) => {
  const categoryMaybe = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: { select: { productLinks: true } },
    },
  });
  if (!categoryMaybe) {
    notFound("Category not found");
  }
  const category = categoryMaybe!;
  if (category._count.productLinks > 0) {
    badRequest("Cannot delete category while products are linked");
  }
  await prisma.category.delete({ where: { id: categoryId } });
};

export const listAdminProducts = async (query: {
  search?: string;
  categoryId?: string;
  active?: boolean;
  page: number;
  limit: number;
}) => {
  const where: Prisma.ProductWhereInput = {
    ...(query.active === undefined ? {} : { active: query.active }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { brand: { contains: query.search, mode: "insensitive" } },
            { slug: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.categoryId
      ? {
          categoryLinks: {
            some: {
              categoryId: query.categoryId,
            },
          },
        }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    total,
    page: query.page,
    limit: query.limit,
    items: products.map(serializeProduct),
  };
};

export const createAdminProduct = async (input: {
  slug?: string;
  brand: string;
  name: string;
  description?: string | null;
  details?: string[] | null;
  priceMinor: number;
  originalPriceMinor?: number | null;
  rating?: number;
  reviewsCount?: number;
  badge?: string | null;
  isNew?: boolean;
  active?: boolean;
  imageUrl: string;
  categoryIds: string[];
  variant: {
    sku?: string;
    size?: string | null;
    colorName?: string | null;
    colorHex?: string | null;
    stockQty: number;
  };
}) => {
  const missingCategories = await prisma.category.count({
    where: {
      id: {
        in: input.categoryIds,
      },
    },
  });
  if (missingCategories !== input.categoryIds.length) {
    badRequest("One or more category IDs are invalid");
  }

  const baseSlug = input.slug ?? `${input.brand}-${input.name}`;
  const slug = await createUniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const defaultSkuBase = slugify(`${input.brand}-${input.name}`).toUpperCase();
  const skuCandidate = input.variant.sku?.trim() || `SKU-${defaultSkuBase}-${Date.now().toString().slice(-6)}`;
  const existingVariant = await prisma.productVariant.findUnique({
    where: { sku: skuCandidate },
  });
  if (existingVariant) {
    badRequest("Variant SKU already exists");
  }

  const product = await prisma.product.create({
    data: {
      slug,
      brand: input.brand,
      name: input.name,
      description: input.description,
      details: input.details ?? undefined,
      currency: "UGX",
      priceMinor: input.priceMinor,
      originalPriceMinor: input.originalPriceMinor ?? undefined,
      rating: input.rating ?? 0,
      reviewsCount: input.reviewsCount ?? 0,
      badge: input.badge ?? undefined,
      isNew: input.isNew ?? false,
      active: input.active ?? true,
      images: {
        create: {
          url: input.imageUrl,
          sortOrder: 0,
        },
      },
      variants: {
        create: {
          sku: skuCandidate,
          size: input.variant.size ?? undefined,
          colorName: input.variant.colorName ?? undefined,
          colorHex: input.variant.colorHex ?? undefined,
          stockQty: input.variant.stockQty,
        },
      },
      categoryLinks: {
        createMany: {
          data: input.categoryIds.map((categoryId) => ({ categoryId })),
          skipDuplicates: true,
        },
      },
    },
    include: productInclude,
  });

  return serializeProduct(product);
};

export const updateAdminProduct = async (
  productId: string,
  input: {
    slug?: string;
    brand?: string;
    name?: string;
    description?: string | null;
    details?: string[] | null;
    priceMinor?: number;
    originalPriceMinor?: number | null;
    rating?: number;
    reviewsCount?: number;
    badge?: string | null;
    isNew?: boolean;
    active?: boolean;
    imageUrl?: string;
    categoryIds?: string[];
    variant?: {
      sku?: string;
      size?: string | null;
      colorName?: string | null;
      colorHex?: string | null;
      stockQty?: number;
    };
  },
) => {
  const existingMaybe = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!existingMaybe) {
    notFound("Product not found");
  }
  const existing = existingMaybe!;

  let nextSlug = input.slug?.trim();
  if (nextSlug) {
    const normalized = slugify(nextSlug);
    const duplicate = await prisma.product.findFirst({
      where: {
        slug: normalized,
        id: { not: productId },
      },
    });
    if (duplicate) {
      badRequest("Product slug already exists");
    }
    nextSlug = normalized;
  }

  if (input.categoryIds) {
    const valid = await prisma.category.count({
      where: {
        id: {
          in: input.categoryIds,
        },
      },
    });
    if (valid !== input.categoryIds.length) {
      badRequest("One or more category IDs are invalid");
    }
  }

  if (input.variant?.sku) {
    const duplicateSku = await prisma.productVariant.findFirst({
      where: {
        sku: input.variant.sku,
        productId: { not: productId },
      },
    });
    if (duplicateSku) {
      badRequest("Variant SKU already exists");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        slug: nextSlug,
        brand: input.brand,
        name: input.name,
        description: input.description,
        details:
          input.details === undefined
            ? undefined
            : input.details === null
              ? Prisma.JsonNull
              : input.details,
        priceMinor: input.priceMinor,
        originalPriceMinor: input.originalPriceMinor,
        rating: input.rating,
        reviewsCount: input.reviewsCount,
        badge: input.badge,
        isNew: input.isNew,
        active: input.active,
      },
    });

    if (input.imageUrl) {
      const firstImage = existing.images.sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (firstImage) {
        await tx.productImage.update({
          where: { id: firstImage.id },
          data: { url: input.imageUrl },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId,
            url: input.imageUrl,
            sortOrder: 0,
          },
        });
      }
    }

    if (input.variant) {
      const firstVariant = existing.variants[0];
      if (!firstVariant) {
        await tx.productVariant.create({
          data: {
            productId,
            sku: input.variant.sku || `SKU-${existing.slug.toUpperCase()}-${Date.now().toString().slice(-5)}`,
            size: input.variant.size ?? undefined,
            colorName: input.variant.colorName ?? undefined,
            colorHex: input.variant.colorHex ?? undefined,
            stockQty: input.variant.stockQty ?? 0,
          },
        });
      } else {
        await tx.productVariant.update({
          where: { id: firstVariant.id },
          data: {
            sku: input.variant.sku,
            size: input.variant.size,
            colorName: input.variant.colorName,
            colorHex: input.variant.colorHex,
            stockQty: input.variant.stockQty,
          },
        });
      }
    }

    if (input.categoryIds) {
      await tx.productCategory.deleteMany({ where: { productId } });
      await tx.productCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({ productId, categoryId })),
        skipDuplicates: true,
      });
    }
  });

  const updated = await prisma.product.findUnique({
    where: { id: productId },
    include: productInclude,
  });
  if (!updated) {
    notFound("Product not found");
  }
  return serializeProduct(updated!);
};

export const deleteAdminProduct = async (productId: string) => {
  await prisma.product.update({
    where: { id: productId },
    data: { active: false },
  }).catch(() => notFound("Product not found"));
};

export const listAdminOrders = async () => {
  const orders = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeAdminOrder);
};

export const updateAdminOrderStatus = async (orderId: string, status: OrderStatus) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: orderInclude,
  }).catch(() => notFound("Order not found"));
  return serializeAdminOrder(order);
};
