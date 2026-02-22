import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotEnv } from "dotenv";
import { runDressImport, writeDressImportReport } from "../src/utils/dress-importer.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(currentDir, "..");
const repoRoot = resolve(currentDir, "../..");

loadDotEnv({ path: resolve(serverDir, ".env") });

type CliOptions = {
  dryRun: boolean;
  verbose: boolean;
  sourceDir: string;
  reportPath: string;
};

const parseCliArgs = (args: string[]): CliOptions => {
  let dryRun = false;
  let verbose = false;
  let sourceDir = resolve(repoRoot, "public/dresses");
  let reportPath = resolve(repoRoot, ".runlogs/dresses-import-report.json");

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    switch (current) {
      case "--dry-run":
        dryRun = true;
        break;
      case "--verbose":
        verbose = true;
        break;
      case "--source-dir":
        sourceDir = resolve(args[index + 1] ?? sourceDir);
        index += 1;
        break;
      case "--report":
        reportPath = resolve(args[index + 1] ?? reportPath);
        index += 1;
        break;
      default:
        break;
    }
  }

  return { dryRun, verbose, sourceDir, reportPath };
};

const run = async () => {
  const options = parseCliArgs(process.argv.slice(2));
  const report = await runDressImport({
    sourceDir: options.sourceDir,
    dryRun: options.dryRun,
    verbose: options.verbose,
  });

  await writeDressImportReport(options.reportPath, report);

  // eslint-disable-next-line no-console
  console.log(
    [
      `Dress import ${options.dryRun ? "(dry-run)" : ""} completed.`,
      `Source: ${report.sourceDir}`,
      `Report: ${resolve(options.reportPath)}`,
      `Files: ${report.summary.filesDiscovered}`,
      `Groups: ${report.summary.groups}`,
      `Products created/updated: ${report.summary.createdProducts}/${report.summary.updatedProducts}`,
      `Variants created/updated: ${report.summary.createdVariants}/${report.summary.updatedVariants}`,
      `Skipped files: ${report.summary.skippedFiles}`,
      `Low confidence parses: ${report.lowConfidence.length}`,
    ].join("\n"),
  );

  if (options.verbose) {
    // eslint-disable-next-line no-console
    console.log("\nLow-confidence filename parses:");
    for (const item of report.lowConfidence) {
      // eslint-disable-next-line no-console
      console.log(`- ${item.filename} [${item.confidence}] ${item.warnings.join("; ")}`);
    }
  }
};

run().catch((error) => {
  console.error("Failed to import dresses:", error);
  process.exit(1);
});
