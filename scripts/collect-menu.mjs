import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMenuPageUrls, extractMenuDetail } from "./parse-menu.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = join(root, "src/data/menu.json");
const listUrl = "https://www.saizeriya.co.jp/menu-popular/";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitAt = args.indexOf("--limit");

if (args.includes("--help")) {
  console.log("Usage: pnpm collect:menu [--limit N] [--dry-run]");
  process.exit(0);
}
if (args.some((arg, index) =>
  !["--limit", "--dry-run"].includes(arg) && (limitAt < 0 || index !== limitAt + 1)
)) {
  throw new Error("Unknown argument. Use --help.");
}
if (limitAt >= 0 && args[limitAt + 1] === undefined) {
  throw new Error("--limit requires a positive integer.");
}
const limit = limitAt < 0 ? Infinity : Number(args[limitAt + 1]);
if (limitAt >= 0 && (!Number.isSafeInteger(limit) || limit < 1)) {
  throw new Error("--limit requires a positive integer.");
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOfficial(url) {
  const target = new URL(url);
  if (target.protocol !== "https:" || target.hostname !== "www.saizeriya.co.jp") {
    throw new Error("Rejected nonofficial URL: " + url);
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SaizeriyaOrderPersonalDataset/0.1 (low-rate personal use)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const finalUrl = new URL(response.url);
      if (finalUrl.protocol !== "https:" || finalUrl.hostname !== "www.saizeriya.co.jp") {
        throw new Error("Request redirected to an unexpected host");
      }
      return response;
    } catch (error) {
      if (attempt === 2) throw error;
      await sleep(1200);
    }
  }
  throw new Error("Unreachable");
}

async function loadExisting() {
  try {
    const data = JSON.parse(await readFile(dataPath, "utf8"));
    if (!Array.isArray(data)) throw new Error("Invalid menu dataset");
    const entries = data.filter((item) => item && typeof item.code === "string" && /^\d{4}$/.test(item.code));
    return new Map(entries.map((item) => [item.code, item]));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
}

async function main() {
  const listing = await (await fetchOfficial(listUrl)).text();
  const pages = extractMenuPageUrls(listing).slice(0, limit);
  if (!pages.length) throw new Error("No product links found; site structure may have changed.");
  const existing = await loadExisting();
  const failures = [];
  let fetched = 0;

  console.log("Found " + pages.length + " product pages" + (dryRun ? " (dry run)" : "") + ".");
  for (const pageUrl of pages) {
    const code = pageUrl.match(/\/(\d{4})\/$/)?.[1] ?? "????";
    try {
      const html = await (await fetchOfficial(pageUrl)).text();
      const detail = extractMenuDetail(html, pageUrl);
      if (!detail) throw new Error("No code-matched official photo URL or product title");
      // Preserve reviewed images, grouped variants and disabled entries.
      // The scraper is discovery-only for existing manually curated records.
      if (!dryRun) existing.set(code, { ...detail, ...existing.get(code) });
      fetched++;
      console.log("OK " + detail.code + " " + detail.name);
    } catch (error) {
      failures.push(code + ": " + error.message);
      console.warn("SKIP " + code + ": " + error.message);
    }
    await sleep(650);
  }
  if (!fetched) throw new Error("No products verified; dataset was left unchanged.");

  if (!dryRun) {
    const items = [...existing.values()].sort((a, b) => a.code.localeCompare(b.code, "ja"));
    await writeFile(dataPath, JSON.stringify(items, null, 2) + "\n", "utf8");
    console.log("Saved " + items.length + " records to src/data/menu.json.");
    console.log("Images are referenced by URL; no image files were downloaded.");
  }
  console.log("Completed: " + fetched + " verified, " + failures.length + " skipped.");
  if (failures.length) console.log("Review skipped entries; existing records were preserved.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
