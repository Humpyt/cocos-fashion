import { slugify } from "./slug.js";

export type ParseConfidence = "high" | "medium" | "low";

export type ParsedShoeFile = {
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
};

export type ShoeImportGroup = {
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
};

const ALT_IMAGE_PATTERN = /\b(back|rear|detail|side|alt)\b/i;
const PRICE_TOKEN_PATTERN = /(\d+(?:\.\d+)?)\s*([kKmM])\b(?!\s*(?:US|UK)\b)/i;
const COPY_SUFFIX_PATTERN = /\s*\((\d+)\)\s*$/;
const COLOR_HINT_WORDS = new Set([
  "black",
  "gold",
  "red",
  "maroon",
  "brown",
  "grey",
  "gray",
  "nude",
  "multi",
  "snake",
  "navy",
  "silver",
  "sliver",
  "white",
]);

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

const getPriceTokenMatches = (value: string): RegExpMatchArray[] =>
  [...value.matchAll(new RegExp(PRICE_TOKEN_PATTERN.source, "gi"))];

const stripPriceTokens = (value: string): string => value.replace(new RegExp(PRICE_TOKEN_PATTERN.source, "gi"), " ");

const escapeForRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  const matches = getPriceTokenMatches(value);
  const matched = matches.at(-1);
  if (!matched) {
    return null;
  }

  const amount = Number.parseFloat(matched[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return matched[2].toLowerCase() === "m" ? Math.round(amount * 1_000_000) : Math.round(amount * 1_000);
};

const normalizeSizeToken = (rawToken: string, defaultCountry?: "US" | "UK"): string | null => {
  const compact = rawToken.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase();
  if (!compact) return null;
  const matched = compact.match(/^(\d{1,2}(?:\.\d+)?)([A-Z]?)(US|UK)?$/);
  if (!matched) {
    return null;
  }
  const base = `${matched[1]}${matched[2]}`;
  const country = matched[3] as "US" | "UK" | undefined;
  if (country) return `${base}${country}`;
  return defaultCountry ? `${base}${defaultCountry}` : base;
};

const sortSizes = (sizes: string[]): string[] => {
  return [...sizes].sort((left, right) => {
    const leftNumeric = Number.parseFloat(left);
    const rightNumeric = Number.parseFloat(right);
    if (Number.isFinite(leftNumeric) && Number.isFinite(rightNumeric) && leftNumeric !== rightNumeric) {
      return leftNumeric - rightNumeric;
    }
    return left.localeCompare(right);
  });
};

export const extractSizes = (normalizedText: string): string[] => {
  const collected = new Set<string>();
  const sizeSegments = normalizedText.match(/\bsizes?\b[^.;]*/gi) ?? [];

  for (const rawSegment of sizeSegments) {
    const segment = stripPriceTokens(rawSegment);
    const defaultCountry = /\bUK\b/i.test(segment) ? "UK" : /\bUS\b/i.test(segment) ? "US" : undefined;
    const tokens = segment
      .replace(/[,&/]+/g, " ")
      .replace(/[.]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token === "SIZE" || token === "SIZES" || token === "AND") {
        continue;
      }
      if (token === "US" || token === "UK") {
        continue;
      }

      let candidate = token;
      const next = tokens[index + 1];
      if ((next === "US" || next === "UK") && !candidate.endsWith("US") && !candidate.endsWith("UK")) {
        candidate = `${candidate}${next}`;
        index += 1;
      }

      const normalized = normalizeSizeToken(candidate, defaultCountry);
      if (normalized) {
        collected.add(normalized);
      }
    }
  }

  if (collected.size === 0) {
    const priceMatches = getPriceTokenMatches(normalizedText);
    const lastPriceIndex = priceMatches.at(-1)?.index;
    const beforePrice =
      (typeof lastPriceIndex === "number" ? normalizedText.slice(0, lastPriceIndex) : normalizedText).replace(
        /[.,/&]/g,
        " ",
      );
    const fallbackCountry = /\bUK\b/i.test(beforePrice) ? "UK" : /\bUS\b/i.test(beforePrice) ? "US" : undefined;
    const tokens = beforePrice
      .split(/\s+/)
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token === "SIZE" || token === "SIZES" || token === "AND") {
        continue;
      }
      if (token === "US" || token === "UK") {
        continue;
      }

      let candidate = token;
      const next = tokens[index + 1];
      if ((next === "US" || next === "UK") && !candidate.endsWith("US") && !candidate.endsWith("UK")) {
        candidate = `${candidate}${next}`;
        index += 1;
      }

      const normalized = normalizeSizeToken(candidate, fallbackCountry);
      if (normalized) {
        collected.add(normalized);
      }
    }
  }

  return sortSizes([...collected]);
};

const extractBrand = (normalizedText: string): string | null => {
  const commaCandidate = normalizedText.split(",")[0]?.trim() ?? "";
  const cleanedCommaCandidate = commaCandidate.replace(/[^a-zA-Z&\s]/g, " ").replace(/\s+/g, " ").trim();
  if (cleanedCommaCandidate && !/\d/.test(cleanedCommaCandidate)) {
    return titleCase(cleanedCommaCandidate);
  }

  const prefixBeforeSizeOrPrice = normalizedText
    .split(/\bsizes?\b/i)[0]
    .replace(/\d+(?:\.\d+)?\s*[kKmM].*/i, "")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = prefixBeforeSizeOrPrice.split(/\s+/).filter(Boolean);
  const brandTokens: string[] = [];
  for (const token of tokens) {
    const lowered = token.toLowerCase();
    if (COLOR_HINT_WORDS.has(lowered)) {
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

const extractDescriptor = (normalizedText: string, brand: string | null): string => {
  let descriptor = normalizedText.toLowerCase();
  descriptor = descriptor.replace(/\d+(?:\.\d+)?\s*[kKmM]\b/g, " ");
  descriptor = descriptor.replace(/\bsizes?\b[^.;]*/g, " ");
  descriptor = descriptor.replace(COPY_SUFFIX_PATTERN, " ");
  descriptor = descriptor.replace(/\b(\d+)\s+size\b/g, "size");
  if (brand) {
    const escapedBrand = escapeForRegex(brand.toLowerCase());
    descriptor = descriptor.replace(new RegExp(`^\\s*${escapedBrand}[,\\s]*`), " ");
  }
  descriptor = descriptor
    .replace(/[,&/.]+/g, " ")
    .replace(/\b(us|uk|size|sizes|shoe|shoes)\b/g, " ")
    .replace(/\b\d{1,2}(?:\.\d+)?[a-z]?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!descriptor) {
    return "Assorted";
  }

  const words = descriptor.split(" ").filter(Boolean).slice(0, 4);
  return words.length ? titleCase(words.join(" ")) : "Assorted";
};

const toColor = (descriptor: string): string => {
  const words = descriptor.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Assorted";
  if (words.length === 1) return words[0];
  return `${words[0]} ${words[1]}`;
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

export const parseShoeFilename = (filename: string): ParsedShoeFile => {
  const normalized = normalizeForParsing(filename);
  const brand = extractBrand(normalized);
  const priceMinor = parsePriceMinor(normalized);
  const sizes = extractSizes(normalized);
  const descriptor = extractDescriptor(normalized, brand);
  const color = toColor(descriptor);
  const isAltImage = ALT_IMAGE_PATTERN.test(normalized);
  const warnings: string[] = [];

  if (!brand) warnings.push("Brand could not be parsed");
  if (priceMinor === null) warnings.push("Price could not be parsed");
  if (sizes.length === 0) warnings.push("No size parsed from filename");
  if (descriptor === "Assorted") warnings.push("Descriptor was ambiguous; defaulted to Assorted");

  const shouldSkip = !brand && priceMinor === null;
  const confidence: ParseConfidence =
    brand && priceMinor !== null && sizes.length > 0
      ? "high"
      : brand && priceMinor !== null
        ? "medium"
        : "low";

  return {
    rawFilename: filename,
    imageUrl: `/ladies-shoes/${encodeURIComponent(filename)}`,
    brand,
    descriptor,
    color,
    sizes,
    priceMinor,
    isAltImage,
    confidence,
    warnings,
    shouldSkip,
  };
};

const buildGroupKey = (parsed: ParsedShoeFile): string =>
  slugify(`${parsed.brand ?? "unknown"}-${parsed.descriptor}-${parsed.priceMinor ?? 0}`);

export const buildShoeImportGroups = (parsedFiles: ParsedShoeFile[]): ShoeImportGroup[] => {
  const grouped = new Map<string, ParsedShoeFile[]>();
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

  const groups: ShoeImportGroup[] = [];
  for (const [key, items] of grouped.entries()) {
    const base = items[0];
    const imageItems = [...items].sort((left, right) => {
      if (left.isAltImage !== right.isAltImage) {
        return left.isAltImage ? 1 : -1;
      }
      return left.rawFilename.localeCompare(right.rawFilename);
    });

    const sizes = sortSizes([...new Set(items.flatMap((item) => item.sizes))]);

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
    });
  }

  groups.sort((left, right) => left.slug.localeCompare(right.slug));
  return groups;
};
