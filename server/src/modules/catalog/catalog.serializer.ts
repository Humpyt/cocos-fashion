import type { Category, Product, ProductImage, ProductVariant } from "@prisma/client";

type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  categoryLinks?: Array<{
    category: Category;
  }>;
};

export const serializeProduct = (product: ProductWithRelations) => ({
  id: product.id,
  slug: product.slug,
  brand: product.brand,
  name: product.name,
  description: product.description,
  details: product.details,
  currency: product.currency,
  priceMinor: product.priceMinor,
  originalPriceMinor: product.originalPriceMinor,
  rating: product.rating,
  reviewsCount: product.reviewsCount,
  badge: product.badge,
  isNew: product.isNew,
  images: product.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder })),
  variants: product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    colorName: variant.colorName,
    colorHex: variant.colorHex,
    stockQty: variant.stockQty,
  })),
  categories: product.categoryLinks?.map((link) => ({
    id: link.category.id,
    slug: link.category.slug,
    name: link.category.name,
  })),
});
