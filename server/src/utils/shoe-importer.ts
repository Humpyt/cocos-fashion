import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { prisma } from "../lib/prisma.js";
import {
  buildShoeImportGroups,
  parseShoeFilename,
  type ParseConfidence,
  type ParsedShoeFile,
  type ShoeImportGroup,
} from "./shoe-import.js";

export type ShoeImportOptions = {
  sourceDir: string;
  dryRun?: boolean;
  verbose?: boolean;
};

type ExistingProductSnapshot = {
  id: string;
  slug: string;
  variants: Array<{ id: string; sku: string }>;
};

type CategoryRefs = {
  shoesCategoryId: string;
  womenCategoryId: string;
};

export type ShoeImportSummary = {
  filesDiscovered: number;
  parsedFiles: number;
  skippedFiles: number;
  groups: number;
  createdProducts: number;
  updatedProducts: number;
  createdVariants: number;
  updatedVariants: number;
};

export type ShoeImportReport = {
  generatedAt: string;
  sourceDir: string;
  dryRun: boolean;
  summary: ShoeImportSummary;
  skippedFiles: Array<{ filename: string; reasons: string[] }>;
  lowConfidence: Array<{
    filename: string;
    confidence: ParseConfidence;
    warnings: string[];
    parsed: Partial<ParsedShoeFile>;
  }>;
  groups: Array<{
    slug: string;
    brand: string;
    descriptor: string;
    color: string;
    priceMinor: number;
    sizes: string[];
    primaryImageUrl: string;
    imageCount: number;
    confidence: string;
    warnings: string[];
  }>;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULT_STOCK_QTY = 100;

const hasImageExtension = (filename: string): boolean => {
  const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(extension);
};

const hashText = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const computeRating = (groupSlug: string): number => {
  const bucket = hashText(groupSlug) % 6;
  return Number((4.1 + bucket * 0.1).toFixed(1));
};

const computeReviewsCount = (groupSlug: string): number => 18 + (hashText(groupSlug) % 180);

const ensureCategories = async (): Promise<CategoryRefs> => {
  const shoes = await prisma.category.upsert({
    where: { slug: "shoes" },
    create: { slug: "shoes", name: "Shoes" },
    update: { name: "Shoes" },
  });

  const women = await prisma.category.upsert({
    where: { slug: "women" },
    create: { slug: "women", name: "Women" },
    update: { name: "Women" },
  });

  return {
    shoesCategoryId: shoes.id,
    womenCategoryId: women.id,
  };
};

const buildProductName = (brand: string, descriptor: string): string =>
  descriptor === "Assorted" ? `${brand} Shoes` : `${brand} ${descriptor} Shoes`;

const buildDescription = (group: ShoeImportGroup): string => {
  const sizeText = group.sizes.length ? group.sizes.join(", ") : "ONE SIZE";
  const priceText = group.priceMinor > 0 ? `UGX ${group.priceMinor.toLocaleString()}` : "a flexible price point";
  return `A ${group.color.toLowerCase()} ${group.brand} pair curated from local ladies shoes imagery in sizes ${sizeText} at ${priceText}.`;
};

const buildVariantSku = (productSlug: string, size: string): string => {
  const normalizedSize = size.replace(/[^a-zA-Z0-9.]+/g, "-").toUpperCase() || "ONE-SIZE";
  return `SKU-${productSlug.toUpperCase()}-${normalizedSize}`;
};

const uniqueSizes = (group: ShoeImportGroup): string[] =>
  group.sizes.length > 0 ? [...new Set(group.sizes)] : ["ONE SIZE"];

const collectFiles = async (sourceDir: string): Promise<string[]> => {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && hasImageExtension(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
};

const diffVariantCounts = (
  existing: ExistingProductSnapshot | undefined,
  group: ShoeImportGroup,
): { created: number; updated: number } => {
  const managedSizes = uniqueSizes(group);
  const targetSkus = managedSizes.map((size) => buildVariantSku(group.slug, size));
  const existingSkus = new Set(existing?.variants.map((variant) => variant.sku) ?? []);
  let created = 0;
  let updated = 0;
  for (const sku of targetSkus) {
    if (existingSkus.has(sku)) {
      updated += 1;
    } else {
      created += 1;
    }
  }
  return { created, updated };
};

const applyGroup = async (
  group: ShoeImportGroup,
  existing: ExistingProductSnapshot | undefined,
  categories: CategoryRefs,
): Promise<ExistingProductSnapshot> => {
  const name = buildProductName(group.brand, group.descriptor);
  const description = buildDescription(group);
  const rating = computeRating(group.slug);
  const reviewsCount = computeReviewsCount(group.slug);
  const sizes = uniqueSizes(group);
  const managedCategoryIds = [categories.shoesCategoryId, categories.womenCategoryId];

  const result = await prisma.$transaction(async (tx) => {
    const product = existing
      ? await tx.product.update({
          where: { id: existing.id },
          data: {
            slug: existing.slug !== group.slug ? group.slug : undefined,
            brand: group.brand,
            name,
            description,
            details: {
              importSource: "ladies-shoes-filename-import",
              color: group.color,
              descriptor: group.descriptor,
              sizes,
            },
            currency: "UGX",
            priceMinor: group.priceMinor,
            originalPriceMinor: null,
            rating,
            reviewsCount,
            badge: "REAL SHOE",
            isNew: true,
            active: true,
          },
        })
      : await tx.product.create({
          data: {
            slug: group.slug,
            brand: group.brand,
            name,
            description,
            details: {
              importSource: "ladies-shoes-filename-import",
              color: group.color,
              descriptor: group.descriptor,
              sizes,
            },
            currency: "UGX",
            priceMinor: group.priceMinor,
            originalPriceMinor: null,
            rating,
            reviewsCount,
            badge: "REAL SHOE",
            isNew: true,
            active: true,
          },
        });

    await tx.productCategory.deleteMany({
      where: {
        productId: product.id,
        categoryId: {
          in: managedCategoryIds,
        },
      },
    });

    await tx.productCategory.createMany({
      data: [
        { productId: product.id, categoryId: categories.womenCategoryId },
        { productId: product.id, categoryId: categories.shoesCategoryId },
      ],
      skipDuplicates: true,
    });

    await tx.productImage.deleteMany({
      where: {
        productId: product.id,
        url: { startsWith: "/ladies-shoes/" },
      },
    });

    await tx.productImage.createMany({
      data: group.imageUrls.map((imageUrl, index) => ({
        productId: product.id,
        url: imageUrl,
        sortOrder: index,
      })),
    });

    const existingVariants = await tx.productVariant.findMany({
      where: { productId: product.id },
      select: { id: true, sku: true },
    });
    const existingBySku = new Map(existingVariants.map((variant) => [variant.sku, variant]));

    const targetSkus = new Set<string>();
    for (const size of sizes) {
      const sku = buildVariantSku(group.slug, size);
      targetSkus.add(sku);
      const current = existingBySku.get(sku);
      if (current) {
        await tx.productVariant.update({
          where: { id: current.id },
          data: {
            size,
            colorName: group.color,
            stockQty: DEFAULT_STOCK_QTY,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            sku,
            size,
            colorName: group.color,
            stockQty: DEFAULT_STOCK_QTY,
          },
        });
      }
    }

    const managedPrefix = `SKU-${group.slug.toUpperCase()}-`;
    await tx.productVariant.deleteMany({
      where: {
        productId: product.id,
        sku: { startsWith: managedPrefix, notIn: [...targetSkus] },
      },
    });

    const refreshedVariants = await tx.productVariant.findMany({
      where: { productId: product.id },
      select: { id: true, sku: true },
    });

    const duplicateProducts = await tx.product.findMany({
      where: {
        id: { not: product.id },
        active: true,
        images: {
          some: {
            url: {
              in: group.imageUrls,
            },
          },
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    for (const duplicate of duplicateProducts) {
      if (duplicate._count.orderItems > 0) {
        continue;
      }
      await tx.product.update({
        where: { id: duplicate.id },
        data: { active: false },
      });
    }

    return {
      id: product.id,
      slug: product.slug,
      variants: refreshedVariants,
    };
  });

  return result;
};

export const runShoeImport = async (options: ShoeImportOptions): Promise<ShoeImportReport> => {
  const sourceDir = resolve(options.sourceDir);
  const dryRun = options.dryRun ?? false;
  const files = await collectFiles(sourceDir);

  const parsedFiles = files.map((filename) => parseShoeFilename(filename));
  const skippedFiles = parsedFiles
    .filter((item) => item.shouldSkip)
    .map((item) => ({ filename: item.rawFilename, reasons: item.warnings.length ? item.warnings : ["Unparseable filename"] }));
  const groups = buildShoeImportGroups(parsedFiles);

  const slugs = groups.map((group) => group.slug);
  const existingProducts = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: {
          id: true,
          slug: true,
          variants: {
            select: { id: true, sku: true },
          },
        },
      })
    : [];
  const existingBySlug = new Map(existingProducts.map((item) => [item.slug, item]));
  const groupImageUrls = [...new Set(groups.flatMap((group) => group.imageUrls))];
  const imageMatches = groupImageUrls.length
    ? await prisma.productImage.findMany({
        where: {
          url: {
            in: groupImageUrls,
          },
          product: {
            active: true,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              createdAt: true,
              variants: {
                select: {
                  id: true,
                  sku: true,
                },
              },
            },
          },
        },
      })
    : [];

  const existingByImage = new Map<string, ExistingProductSnapshot>();
  const existingImageProductCreatedAt = new Map<string, Date>();
  for (const imageMatch of imageMatches) {
    const current = existingImageProductCreatedAt.get(imageMatch.url);
    if (current && current <= imageMatch.product.createdAt) {
      continue;
    }
    existingImageProductCreatedAt.set(imageMatch.url, imageMatch.product.createdAt);
    existingByImage.set(imageMatch.url, {
      id: imageMatch.product.id,
      slug: imageMatch.product.slug,
      variants: imageMatch.product.variants,
    });
  }

  const summary: ShoeImportSummary = {
    filesDiscovered: files.length,
    parsedFiles: parsedFiles.length,
    skippedFiles: skippedFiles.length,
    groups: groups.length,
    createdProducts: 0,
    updatedProducts: 0,
    createdVariants: 0,
    updatedVariants: 0,
  };

  const categories = dryRun ? null : await ensureCategories();

  for (const group of groups) {
    const existing =
      existingBySlug.get(group.slug) ??
      group.imageUrls.map((url) => existingByImage.get(url)).find((item): item is ExistingProductSnapshot => Boolean(item));
    if (existing) {
      summary.updatedProducts += 1;
    } else {
      summary.createdProducts += 1;
    }

    const variantDiff = diffVariantCounts(existing, group);
    summary.createdVariants += variantDiff.created;
    summary.updatedVariants += variantDiff.updated;

    if (dryRun) {
      continue;
    }
    if (!categories) {
      throw new Error("Category references missing while running non-dry import");
    }

    const refreshed = await applyGroup(group, existing, categories);
    existingBySlug.set(group.slug, refreshed);
  }

  const lowConfidence = parsedFiles
    .filter((item) => item.confidence !== "high")
    .map((item) => ({
      filename: item.rawFilename,
      confidence: item.confidence,
      warnings: item.warnings,
      parsed: {
        brand: item.brand,
        descriptor: item.descriptor,
        color: item.color,
        sizes: item.sizes,
        priceMinor: item.priceMinor,
      },
    }));

  return {
    generatedAt: new Date().toISOString(),
    sourceDir,
    dryRun,
    summary,
    skippedFiles,
    lowConfidence,
    groups: groups.map((group) => ({
      slug: group.slug,
      brand: group.brand,
      descriptor: group.descriptor,
      color: group.color,
      priceMinor: group.priceMinor,
      sizes: uniqueSizes(group),
      primaryImageUrl: group.primaryImageUrl,
      imageCount: group.imageUrls.length,
      confidence: group.confidence,
      warnings: group.warnings,
    })),
  };
};

export const writeShoeImportReport = async (reportPath: string, report: ShoeImportReport) => {
  const fullPath = resolve(reportPath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
};
