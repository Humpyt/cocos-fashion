import { slugify } from "./slug.js";

export type ParseConfidence = "high" | "medium" | "low";

export type ParsedMenFile = {
  rawFilename: string;
  imageUrl: string;
  brand: string | null;
  descriptor: string;
  color: string;
  sizes: string[];
  priceMinor: number | null;
  isAltImage: boolean;
  confidence: ParseConfidence;
  warnings: string[];
  shouldSkip: boolean;
  subcategory?: string;
};

export type MenImportGroup = {
  key: string;
  slug: string;
  brand: string;
  descriptor: string;
  color: string;
  priceMinor: number;
  sizes: string[];
  imageUrls: string[];
  primaryImageUrl: string;
  sourceFilenames: string[];
  confidence: ParseConfidence;
  warnings: string[];
  subcategory: string | null;
};

const ALT_IMAGE_PATTERN = /\b(back|rear|detail|side|alt)\b/i;
const PRICE_TOKEN_PATTERN = /(\d+(?:\.\d+)?)\s*[kK]\b(?!\s*(?:US|UK)\b)/i;
const COPY_SUFFIX_PATTERN = /\s*\((\d+)\)\s*$/;
const SIZE_RANGE_PATTERN = /(\d+(?:\.\d+)?)\s*(?:in)?\s*(?:to|To|TO|-)\s*(\d+(?:\.\d+)?)\s*in/gi;

const SIZE_CODE_ORDER = [
  "XXXS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

const titleCaseWord = (word: string): string => {
  if (!word) return word;
  if (/^[A-Z0-9&]+$/.test(word)) return word;
  return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
};

const titleCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(" ");

const normalizeForParsing = (filename: string): string =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_]+/g, " ")
    .replace(COPY_SUFFIX_PATTERN, "")
    .replace(/\b(\d+)\s+size\b/gi, "size")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const parsePriceMinor = (value: string): number | null => {
  const match = value.match(PRICE_TOKEN_PATTERN);
  if (!match) {
    return null;
  }

  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 1_000);
};

const normalizeSizeToken = (rawToken: string): string | null => {
  const token = rawToken.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase();
  if (!token) return null;

  // Neck sizes (decimal values like 15.5, 16.5, 17.5)
  if (/^\d{1,2}\.\d+$/.test(token)) {
    // Format as "15.5", "16.5", etc.
    return token;
  }

  // Letter sizes
  if (/^(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL)$/.test(token)) {
    return token;
  }

  // Integer sizes
  if (/^\d{1,2}$/.test(token)) {
    return token;
  }

  return null;
};

const extractSizeRanges = (normalizedText: string): string[] => {
  const ranges: string[] = [];
  const rangeMatches = [...normalizedText.matchAll(SIZE_RANGE_PATTERN)];

  for (const match of rangeMatches) {
    const start = Number.parseFloat(match[1]);
    const end = Number.parseFloat(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && start <= end) {
      // Generate range of neck sizes in 0.5 increments
      const step = 0.5;
      for (let size = start; size <= end; size = Math.round((size + step) * 10) / 10) {
        ranges.push(size.toFixed(1));
      }
    }
  }

  return [...new Set(ranges)];
};

export const extractSizes = (normalizedText: string): string[] => {
  const sizeRanges = extractSizeRanges(normalizedText);

  // If we found size ranges, return them
  if (sizeRanges.length > 0) {
    return [...new Set(sizeRanges)].sort((left, right) =>
      Number.parseFloat(left) - Number.parseFloat(right),
    );
  }

  const tokens = normalizedText
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sizes = new Set<string>();
  for (const token of tokens) {
    const normalized = normalizeSizeToken(token);
    if (normalized && !sizes.has(normalized)) {
      sizes.add(normalized);
    }
  }

  const ordered = [...sizes];
  ordered.sort((left, right) => {
    // Try numeric comparison for neck sizes
    const leftNum = Number.parseFloat(left);
    const rightNum = Number.parseFloat(right);
    if (Number.isFinite(leftNum) && Number.isFinite(rightNum) && leftNum !== rightNum) {
      return leftNum - rightNum;
    }

    // Use SIZE_CODE_ORDER for letter sizes
    const leftIndex = SIZE_CODE_ORDER.indexOf(left);
    const rightIndex = SIZE_CODE_ORDER.indexOf(right);
    if (leftIndex >= 0 && rightIndex >= 0) {
      return leftIndex - rightIndex;
    }
    if (leftIndex >= 0) return -1;
    if (rightIndex >= 0) return 1;

    // Fall back to lexicographic comparison
    return left.localeCompare(right);
  });

  return ordered;
};

const inferDescriptor = (value: string): string => {
  const lower = value.toLowerCase();

  if (/\bpolo|polos\b/.test(lower)) return "Polo";
  if (/\bchecked?|check\b/.test(lower)) return "Checked";
  if (/\bstriped?\b/.test(lower)) return "Striped";
  if (/\bformal|dress|office\b/.test(lower)) return "Formal";
  if (/\bcasual\b/.test(lower)) return "Casual";
  if (/\bsport|athletic\b/.test(lower)) return "Sport";

  return "Shirt";
};

const extractBrand = (normalizedText: string): string | null => {
  const commaCandidate = normalizedText.split(",")[0]?.trim() ?? "";
  const cleanedCommaCandidate = commaCandidate.replace(/[^a-zA-Z&\s]/g, " ").replace(/\s+/g, " ").trim();
  if (cleanedCommaCandidate && !/\d/.test(cleanedCommaCandidate)) {
    return titleCase(cleanedCommaCandidate);
  }

  // Try to find brand before size or price
  const beforeSizeOrPrice = normalizedText
    .split(/\bsize\b/i)[0]
    .split(/\d+\.\d+\s*in/i)[0]
    .replace(/\d+(?:\.\d+)?\s*[kK].*/i, "")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = beforeSizeOrPrice.split(/\s+/).filter(Boolean);
  const brandTokens: string[] = [];
  for (const token of tokens) {
    const lowered = token.toLowerCase();
    // Skip color words
    if (["black", "blue", "white", "red", "navy", "grey", "gray", "brown", "beige", "green", "multi"].includes(lowered)) {
      break;
    }
    if (/^\d/.test(token)) {
      break;
    }
    brandTokens.push(token);
    if (brandTokens.length >= 4) {
      break;
    }
  }

  const candidate = brandTokens.join(" ").trim();
  return candidate ? titleCase(candidate) : null;
};

const extractColor = (normalizedText: string, brand: string | null): string => {
  const lower = normalizedText.toLowerCase();
  const withoutPrice = lower.replace(/\d+(?:\.\d+)?\s*[kK]\b/g, " ");
  const withoutSizeSegments = withoutPrice.replace(/\bsize\b[^.;]*/gi, " ");
  const withoutSizeRanges = withoutSizeSegments.replace(SIZE_RANGE_PATTERN, " ");

  let descriptor = withoutSizeRanges;
  if (brand) {
    const brandLower = brand.toLowerCase();
    if (descriptor.startsWith(brandLower)) {
      descriptor = descriptor.slice(brandLower.length);
    }
  } else if (descriptor.includes(",")) {
    descriptor = descriptor.slice(descriptor.indexOf(",") + 1);
  }

  descriptor = descriptor
    .replace(/[,.]/g, " ")
    .replace(ALT_IMAGE_PATTERN, " ")
    .replace(/\b(polos?|shirts?|formal|casual|sport|athletic|office|dress|checked?|striped?)\b/gi, " ")
    .replace(/\b(us|uk|size|sizes|and|or|with|in|to)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!descriptor) return "Assorted";
  const words = descriptor
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => !normalizeSizeToken(word))
    .slice(0, 3);
  if (!words.length) return "Assorted";
  return titleCase(words.join(" "));
};

const inferSubcategory = (filename: string): string | null => {
  const lower = filename.toLowerCase();
  if (/\bshirts?\b/.test(lower)) return "shirts";
  if (/\bpolos?\b/.test(lower)) return "polos";
  return null;
};

const confidenceRank = (value: ParseConfidence): number => {
  switch (value) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
};

const lowerConfidence = (left: ParseConfidence, right: ParseConfidence): ParseConfidence =>
  confidenceRank(left) <= confidenceRank(right) ? left : right;

export const parseMenFilename = (filename: string, subcategory?: string): ParsedMenFile => {
  const normalized = normalizeForParsing(filename);
  const brand = extractBrand(normalized);
  const priceMinor = parsePriceMinor(normalized);
  const sizes = extractSizes(normalized);
  const descriptor = inferDescriptor(normalized);
  const color = extractColor(normalized, brand);
  const isAltImage = ALT_IMAGE_PATTERN.test(normalized);
  const warnings: string[] = [];

  if (!brand) warnings.push("Brand could not be parsed");
  if (priceMinor === null) warnings.push("Price could not be parsed");
  if (sizes.length === 0) warnings.push("No size parsed from filename");
  if (color === "Assorted") warnings.push("Color was ambiguous; defaulted to Assorted");

  const shouldSkip = !brand && priceMinor === null;
  const confidence: ParseConfidence =
    brand && priceMinor !== null && sizes.length > 0
      ? "high"
      : brand && priceMinor !== null
        ? "medium"
        : "low";

  // Determine image URL based on subcategory
  const urlPath = subcategory ? `/Men/${subcategory}/${encodeURIComponent(filename)}` : `/Men/${encodeURIComponent(filename)}`;

  return {
    rawFilename: filename,
    imageUrl: urlPath,
    brand,
    descriptor,
    color,
    sizes,
    priceMinor,
    isAltImage,
    confidence,
    warnings,
    shouldSkip,
    subcategory,
  };
};

const buildGroupKey = (parsed: ParsedMenFile, subcategory?: string): string => {
  const prefix = subcategory ? `${subcategory}-` : "";
  return slugify(
    `${prefix}${parsed.brand ?? "unknown"}-${parsed.descriptor}-${parsed.color}-${parsed.priceMinor ?? 0}`,
  );
};

export const buildMenImportGroups = (
  parsedFiles: Array<ParsedMenFile & { subcategory?: string }>,
): MenImportGroup[] => {
  const grouped = new Map<string, ParsedMenFile[]>();
  for (const parsed of parsedFiles) {
    if (parsed.shouldSkip) continue;
    const key = buildGroupKey(parsed, parsed.subcategory);
    const existing = grouped.get(key);
    if (existing) {
      existing.push(parsed);
    } else {
      grouped.set(key, [parsed]);
    }
  }

  const groups: MenImportGroup[] = [];
  for (const [key, items] of grouped.entries()) {
    const base = items[0];
    const imageItems = [...items].sort((left, right) => {
      if (left.isAltImage !== right.isAltImage) {
        return left.isAltImage ? 1 : -1;
      }
      return left.rawFilename.localeCompare(right.rawFilename);
    });

    const sizeSet = new Set<string>();
    for (const item of items) {
      for (const size of item.sizes) {
        sizeSet.add(size);
      }
    }
    const sizes = [...sizeSet];
    sizes.sort((left, right) => {
      const leftNum = Number.parseFloat(left);
      const rightNum = Number.parseFloat(right);
      if (Number.isFinite(leftNum) && Number.isFinite(rightNum) && leftNum !== rightNum) {
        return leftNum - rightNum;
      }
      return left.localeCompare(right);
    });

    let confidence: ParseConfidence = "high";
    const warnings = new Set<string>();
    for (const item of items) {
      confidence = lowerConfidence(confidence, item.confidence);
      for (const warning of item.warnings) {
        warnings.add(warning);
      }
    }

    groups.push({
      key,
      slug: key,
      brand: base.brand ?? "Unknown",
      descriptor: base.descriptor,
      color: base.color,
      priceMinor: base.priceMinor ?? 0,
      sizes,
      imageUrls: imageItems.map((item) => item.imageUrl),
      primaryImageUrl: imageItems[0]?.imageUrl ?? "",
      sourceFilenames: imageItems.map((item) => item.rawFilename),
      confidence,
      warnings: [...warnings],
      subcategory: (items[0] as ParsedMenFile & { subcategory?: string }).subcategory ?? null,
    });
  }

  groups.sort((left, right) => left.slug.localeCompare(right.slug));
  return groups;
};
