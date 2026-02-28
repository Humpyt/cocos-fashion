import { slugify } from "./slug.js";

export type ParseConfidence = "high" | "medium" | "low";

export type ParsedBlouseFile = {
  rawFilename: string;
  imageUrl: string;
  brand: string | null;
  styleDescriptor: string;
  color: string;
  sizes: string[];
  priceMinor: number | null;
  isAltImage: boolean;
  confidence: ParseConfidence;
  warnings: string[];
  shouldSkip: boolean;
};

export type BlouseImportGroup = {
  key: string;
  slug: string;
  brand: string;
  styleDescriptor: string;
  color: string;
  priceMinor: number;
  sizes: string[];
  imageUrls: string[];
  primaryImageUrl: string;
  sourceFilenames: string[];
  confidence: ParseConfidence;
  warnings: string[];
};

const ALT_IMAGE_PATTERN = /\b(back|rear|detail|side|alt)\b/i;
const STYLE_PATTERNS: Array<{ pattern: RegExp; style: string }> = [
  { pattern: /\bfloral|flowers?\b/i, style: "Floral" },
  { pattern: /\bprinted?|stripped|striped|snake\s*print\b/i, style: "Printed" },
  { pattern: /\bchecked?|check\b/i, style: "Checked" },
  { pattern: /\bstriped?\b/i, style: "Striped" },
  { pattern: /\bsolid\b/i, style: "Solid" },
  { pattern: /\bmulti\b/i, style: "Multi" },
];

const STYLE_FILLER_PATTERN =
  /\b(linen|blend|sequin|sequins|jacket|floral|flower|flowers|checked?|check|printed?|striped|stripped|solid|multi|snake|print)\b/gi;
const COLOR_FILLER_PATTERN =
  /\b(size|sizes|and|or|with|set|team|buttons?|button|blouse|us|w)\b/gi;
// Remove copy suffixes like " 2", " (2)", "(2)" that appear after prices anywhere in filename
const COPY_SUFFIX_PATTERN = /\s*\(\d+\)\s*|\s+\d+\s*$/;

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
  "0X",
  "1X",
  "2X",
  "3X",
  "4X",
];

const titleCaseWord = (word: string): string => {
  if (!word) return word;
  if (/^[A-Z0-9&]+$/.test(word)) return word;
  if (/^[a-z]{1,4}$/.test(word) && word.toUpperCase() === "DKNY") return "DKNY";
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
    .replace(/\bsizes(?=\d|[a-z])/gi, "sizes ")
    .replace(/\bsize(?!s\b)(?=\d|[a-z])/gi, "size ")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const parsePriceMinor = (value: string): number | null => {
  const million = value.match(/(\d+(?:\.\d+)?)\s*[mM]\b/);
  if (million) {
    return Math.round(Number.parseFloat(million[1]) * 1_000_000);
  }

  const thousand = value.match(/(\d+(?:\.\d+)?)\s*[kK]\b/);
  if (thousand) {
    return Math.round(Number.parseFloat(thousand[1]) * 1_000);
  }

  return null;
};

const normalizeSizeToken = (rawToken: string, nextRawToken?: string): string | null => {
  const token = rawToken.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const nextToken = (nextRawToken ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!token) return null;

  if (/^\d{1,2}(US|W)$/.test(token)) return token;
  if (/^\d{1,2}$/.test(token)) {
    if (nextToken === "US" || nextToken === "W") {
      return `${token}${nextToken}`;
    }
    return token;
  }
  if (/^(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|0X|1X|2X|3X|4X)$/.test(token)) return token;

  return null;
};

export const extractSizes = (normalizedText: string): string[] => {
  const tokens = normalizedText
    .toLowerCase()
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sizes = new Set<string>();
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index].replace(/[^a-z0-9]/g, "");
    if (token !== "size" && token !== "sizes") {
      continue;
    }

    for (let cursor = index + 1; cursor < Math.min(tokens.length, index + 10); cursor += 1) {
      const candidate = tokens[cursor];
      const normalizedCandidate = candidate.replace(/[^a-z0-9]/g, "");

      if (!normalizedCandidate || normalizedCandidate === "and" || normalizedCandidate === "or" || normalizedCandidate === "with") {
        continue;
      }
      if (/\d+(?:\.\d+)?[km]$/.test(normalizedCandidate)) {
        break;
      }

      const maybeSize = normalizeSizeToken(normalizedCandidate, tokens[cursor + 1]);
      if (maybeSize) {
        sizes.add(maybeSize);
        continue;
      }

      if (sizes.size > 0) {
        break;
      }
    }
  }

  const ordered = [...sizes];
  ordered.sort((left, right) => {
    const leftIndex = SIZE_CODE_ORDER.indexOf(left);
    const rightIndex = SIZE_CODE_ORDER.indexOf(right);
    if (leftIndex >= 0 || rightIndex >= 0) {
      return (leftIndex >= 0 ? leftIndex : Number.POSITIVE_INFINITY) - (rightIndex >= 0 ? rightIndex : Number.POSITIVE_INFINITY);
    }
    if (/^\d+/.test(left) && /^\d+/.test(right)) {
      return Number.parseInt(left, 10) - Number.parseInt(right, 10);
    }
    return left.localeCompare(right);
  });

  return ordered;
};

const inferStyleDescriptor = (value: string): string => {
  for (const styleRule of STYLE_PATTERNS) {
    if (styleRule.pattern.test(value)) {
      return styleRule.style;
    }
  }
  return "Blouse";
};

const extractBrand = (normalizedText: string): string | null => {
  const beforeComma = normalizedText.split(",")[0]?.trim() ?? "";
  const beforePunctuation = beforeComma.split(/[.;]/)[0]?.trim() ?? "";
  const candidate = beforePunctuation || beforeComma;
  if (!candidate) return null;

  const cleaned = candidate.replace(/[^a-zA-Z0-9&\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || /\d/.test(cleaned)) return null;
  return titleCase(cleaned);
};

const extractColor = (normalizedText: string, brand: string | null): string => {
  const lower = normalizedText.toLowerCase();
  const withoutPrice = lower.replace(/\d+(?:\.\d+)?\s*[km]\b/g, " ");
  const withoutSizeSegments = withoutPrice.replace(/\bsizes?\b[^,.;]*/g, " ");

  let descriptor = withoutSizeSegments;
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
    .replace(STYLE_FILLER_PATTERN, " ")
    .replace(COLOR_FILLER_PATTERN, " ")
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

export const parseBlouseFilename = (filename: string): ParsedBlouseFile => {
  const normalized = normalizeForParsing(filename);
  const brand = extractBrand(normalized);
  const priceMinor = parsePriceMinor(normalized);
  const sizes = extractSizes(normalized);
  const styleDescriptor = inferStyleDescriptor(normalized);
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

  return {
    rawFilename: filename,
    imageUrl: `/blouses/${encodeURIComponent(filename)}`,
    brand,
    styleDescriptor,
    color,
    sizes,
    priceMinor,
    isAltImage,
    confidence,
    warnings,
    shouldSkip,
  };
};

const buildGroupKey = (parsed: ParsedBlouseFile): string =>
  slugify(
    `${parsed.brand ?? "unknown"}-${parsed.styleDescriptor}-${parsed.color}-${parsed.priceMinor ?? 0}`,
  );

export const buildBlouseImportGroups = (parsedFiles: ParsedBlouseFile[]): BlouseImportGroup[] => {
  const grouped = new Map<string, ParsedBlouseFile[]>();
  for (const parsed of parsedFiles) {
    if (parsed.shouldSkip) continue;
    const key = buildGroupKey(parsed);
    const existing = grouped.get(key);
    if (existing) {
      existing.push(parsed);
    } else {
      grouped.set(key, [parsed]);
    }
  }

  const groups: BlouseImportGroup[] = [];
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
    sizes.sort((left, right) => left.localeCompare(right));

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
      styleDescriptor: base.styleDescriptor,
      color: base.color,
      priceMinor: base.priceMinor ?? 0,
      sizes,
      imageUrls: imageItems.map((item) => item.imageUrl),
      primaryImageUrl: imageItems[0]?.imageUrl ?? "",
      sourceFilenames: imageItems.map((item) => item.rawFilename),
      confidence,
      warnings: [...warnings],
    });
  }

  groups.sort((left, right) => left.slug.localeCompare(right.slug));
  return groups;
};
