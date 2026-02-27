import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { prisma } from "../lib/prisma.js";
import {
  buildMenImportGroups,
  parseMenFilename,
  type MenImportGroup,
  type ParseConfidence,
  type ParsedMenFile,
} from "./men-import.js";

export type MenImportOptions = {
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
  menCategoryId: string;
  shirtsCategoryId?: string;
  polosCategoryId?: string;
  tshirtsCategoryId?: string;
};

export type MenImportSummary = {
  filesDiscovered: number;
  parsedFiles: number;
  skippedFiles: number;
  groups: number;
  createdProducts: number;
  updatedProducts: number;
  createdVariants: number;
  updatedVariants: number;
};

export type MenImportReport = {
  generatedAt: string;
  sourceDir: string;
  dryRun: boolean;
  summary: MenImportSummary;
  skippedFiles: Array<{ filename: string; reasons: string[] }>;
  lowConfidence: Array<{
    filename: string;
    confidence: ParseConfidence;
    warnings: string[];
    parsed: Partial<ParsedMenFile>;
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
    subcategory: string | null;
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

const ensureCategories = async (subcategories: Set<string>): Promise<CategoryRefs> => {
  const men = await prisma.category.upsert({
    where: { slug: "men" },
    create: { slug: "men", name: "Men" },
    update: { name: "Men" },
  });

  let shirtsCategoryId: string | undefined;
  let polosCategoryId: string | undefined;
  let tshirtsCategoryId: string | undefined;

  if (subcategories.has("shirts")) {
    const shirts = await prisma.category.upsert({
      where: { slug: "shirts" },
      create: { slug: "shirts", name: "Shirts" },
      update: { name: "Shirts" },
    });
    shirtsCategoryId = shirts.id;
  }

  if (subcategories.has("polos")) {
    const polos = await prisma.category.upsert({
      where: { slug: "polos" },
      create: { slug: "polos", name: "Polos" },
      update: { name: "Polos" },
    });
    polosCategoryId = polos.id;
  }

  if (subcategories.has("t-shirts")) {
    const tshirts = await prisma.category.upsert({
      where: { slug: "t-shirts" },
      create: { slug: "t-shirts", name: "T-Shirts" },
      update: { name: "T-Shirts" },
    });
    tshirtsCategoryId = tshirts.id;
  }

  return {
    menCategoryId: men.id,
    shirtsCategoryId,
    polosCategoryId,
    tshirtsCategoryId,
  };
};

const buildProductName = (brand: string, descriptor: string): string =>
  descriptor === "Shirt" ? `${brand} Shirt` : `${brand} ${descriptor}`;

const buildDescription = (group: MenImportGroup): string => {
  const sizeText = group.sizes.length ? group.sizes.join(", ") : "ONE SIZE";
  const priceText = group.priceMinor > 0 ? `UGX ${group.priceMinor.toLocaleString()}` : "a flexible price point";
  return `A ${group.color.toLowerCase()} ${group.brand} ${group.descriptor.toLowerCase()} in sizes ${sizeText}, curated from local men's catalog imagery at ${priceText}.`;
};

const buildVariantSku = (productSlug: string, size: string): string => {
  const normalizedSize = size.replace(/[^a-zA-Z0-9.]+/g, "-").toUpperCase() || "ONE-SIZE";
  return `SKU-${productSlug.toUpperCase()}-${normalizedSize}`;
};

const uniqueSizes = (group: MenImportGroup): string[] =>
  group.sizes.length > 0 ? [...new Set(group.sizes)] : ["ONE SIZE"];

const collectFilesWithSubdirs = async (sourceDir: string): Promise<Array<{ filename: string; subcategory?: string }>> => {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const results: Array<{ filename: string; subcategory?: string }> = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subdirPath = resolve(sourceDir, entry.name);
      const subEntries = await readdir(subdirPath, { withFileTypes: true });
      // Normalize subdirectory name to lowercase slug format
      const normalizedSubcategory = entry.name.toLowerCase();
      for (const subEntry of subEntries) {
        if (subEntry.isFile() && hasImageExtension(subEntry.name)) {
          results.push({ filename: subEntry.name, subcategory: normalizedSubcategory });
        }
      }
    } else if (entry.isFile() && hasImageExtension(entry.name)) {
      results.push({ filename: entry.name });
    }
  }

  return results.sort((left, right) => left.filename.localeCompare(right.filename));
};

const diffVariantCounts = (
  existing: ExistingProductSnapshot | undefined,
  group: MenImportGroup,
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
  group: MenImportGroup,
  existing: ExistingProductSnapshot | undefined,
  categories: CategoryRefs,
): Promise<ExistingProductSnapshot> => {
  const name = buildProductName(group.brand, group.descriptor);
  const description = buildDescription(group);
  const rating = computeRating(group.slug);
  const reviewsCount = computeReviewsCount(group.slug);
  const sizes = uniqueSizes(group);

  const managedCategoryIds: string[] = [categories.menCategoryId];
  if (group.subcategory === "shirts" && categories.shirtsCategoryId) {
    managedCategoryIds.push(categories.shirtsCategoryId);
  } else if (group.subcategory === "polos" && categories.polosCategoryId) {
    managedCategoryIds.push(categories.polosCategoryId);
  } else if (group.subcategory === "t-shirts" && categories.tshirtsCategoryId) {
    managedCategoryIds.push(categories.tshirtsCategoryId);
  }

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
              importSource: "men-filename-import",
              color: group.color,
              descriptor: group.descriptor,
              sizes,
              subcategory: group.subcategory,
            },
            currency: "UGX",
            priceMinor: group.priceMinor,
            originalPriceMinor: null,
            rating,
            reviewsCount,
            badge: "REAL MENS",
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
              importSource: "men-filename-import",
              color: group.color,
              descriptor: group.descriptor,
              sizes,
              subcategory: group.subcategory,
            },
            currency: "UGX",
            priceMinor: group.priceMinor,
            originalPriceMinor: null,
            rating,
            reviewsCount,
            badge: "REAL MENS",
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
      data: managedCategoryIds.map((categoryId) => ({
        productId: product.id,
        categoryId,
      })),
      skipDuplicates: true,
    });

    await tx.productImage.deleteMany({
      where: {
        productId: product.id,
        url: { startsWith: "/Men/" },
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

export const runMenImport = async (options: MenImportOptions): Promise<MenImportReport> => {
  const sourceDir = resolve(options.sourceDir);
  const dryRun = options.dryRun ?? false;
  const filesWithSubdirs = await collectFilesWithSubdirs(sourceDir);

  const parsedFiles = filesWithSubdirs.map((item) =>
    parseMenFilename(item.filename, item.subcategory),
  ) as Array<ParsedMenFile & { subcategory?: string }>;
  const skippedFiles = parsedFiles
    .filter((item) => item.shouldSkip)
    .map((item) => ({ filename: item.rawFilename, reasons: item.warnings.length ? item.warnings : ["Unparseable filename"] }));
  const groups = buildMenImportGroups(parsedFiles);

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

  const summary: MenImportSummary = {
    filesDiscovered: filesWithSubdirs.length,
    parsedFiles: parsedFiles.length,
    skippedFiles: skippedFiles.length,
    groups: groups.length,
    createdProducts: 0,
    updatedProducts: 0,
    createdVariants: 0,
    updatedVariants: 0,
  };

  // Collect all subcategories for category creation
  const subcategories = new Set(
    groups
      .map((group) => group.subcategory)
      .filter((sub): sub is string => sub !== null),
  );

  const categories = dryRun ? null : await ensureCategories(subcategories);

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
      subcategory: group.subcategory,
    })),
  };
};

export const writeMenImportReport = async (reportPath: string, report: MenImportReport) => {
  const fullPath = resolve(reportPath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
};
