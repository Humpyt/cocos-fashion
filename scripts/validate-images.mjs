import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const SOURCE_FILES = ["imageStore.ts", "server/prisma/seed.ts"];
const UNSPLASH_PATTERN = /https:\/\/images\.unsplash\.com\/photo-[^\s"'`]+/g;

const collectUrls = async () => {
  const urls = new Set();

  for (const filePath of SOURCE_FILES) {
    const content = await readFile(resolve(filePath), "utf8");
    const matches = content.match(UNSPLASH_PATTERN) ?? [];
    for (const match of matches) {
      urls.add(match);
    }
  }

  return [...urls];
};

const checkUrl = async (url) => {
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      url,
      ok: false,
      status: "ERR",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const run = async () => {
  const urls = await collectUrls();
  const results = [];

  for (const url of urls) {
    results.push(await checkUrl(url));
  }

  const failed = results.filter((result) => !result.ok);

  if (!failed.length) {
    console.log(`All image URLs are reachable (${results.length} checked).`);
    return;
  }

  console.error(`Found ${failed.length} broken image URL(s) out of ${results.length} checked:`);
  for (const failure of failed) {
    const suffix = failure.error ? ` (${failure.error})` : "";
    console.error(`- [${failure.status}] ${failure.url}${suffix}`);
  }
  process.exitCode = 1;
};

run().catch((error) => {
  console.error("Failed to validate image URLs:", error);
  process.exit(1);
});
