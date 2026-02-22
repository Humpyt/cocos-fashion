import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../utils/http.js";
import { serializeProduct } from "./catalog.serializer.js";

const listProductsSelect = {
  images: true,
  variants: true,
  categoryLinks: {
    include: {
      category: true,
    },
  },
} satisfies Prisma.ProductInclude;

const resolveOrderBy = (sort: "newest" | "price_asc" | "price_desc" | "rating_desc"): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case "price_asc":
      return { priceMinor: "asc" };
    case "price_desc":
      return { priceMinor: "desc" };
    case "rating_desc":
      return { rating: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      productLinks: {
        where: {
          product: {
            active: true,
          },
        },
        select: {
          productId: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    productCount: category.productLinks.length,
  }));
};

export const listProducts = async (query: {
  category?: string;
  search?: string;
  sort: "newest" | "price_asc" | "price_desc" | "rating_desc";
  page: number;
  limit: number;
}) => {
  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(query.category
      ? {
          categoryLinks: {
            some: {
              category: { slug: query.category },
            },
          },
        }
      : {}),
    ...(query.search
      ? {
          OR: [
            {
              name: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              brand: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: listProductsSelect,
      orderBy: resolveOrderBy(query.sort),
      skip,
      take: query.limit,
    }),
  ]);

  return {
    page: query.page,
    limit: query.limit,
    total,
    items: products.map(serializeProduct),
  };
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: listProductsSelect,
  });
  if (!product || !product.active) {
    notFound("Product not found");
  }
  return serializeProduct(product!);
};
