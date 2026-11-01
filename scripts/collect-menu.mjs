import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMenuPageUrls, extractMenuDetail } from "./parse-menu.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "src/data/menu.json");
const IMAGE_DIR = join(ROOT, "public/images");
const LIST_URL = "https://www.saizeriya.co.jp/menu-popular/";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const limitAt = args.indexOf("--limit");

if (args.includes("--help")) {
  console.log("Usage: npm run collect:menu -- [--limit N] [--dry-run] [--force]");
  process.exit(0);
}
if (args.some((arg, i) => !["--limit", "--dry-run", "--force"].includes(arg) && !(i === limitAt + 1 && limitAt !== -1))) {
  throw new Error("Unknown argument. Use --help.");
}
const limit = limitAt === -1 ? Number.POSITIVE_INFINITY : Number(args[limitAt + 1]);
if (limitAt !== -1 && (!Number.isSafeInteger(limit) || limit < 1)) {
  throw new Error("--limit requires a positive integer.");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOfficial(url) {
  const target = new URL(url);
  if (target.protocol !== "https:" || target.hostname !== "www.saizeriya.co.jp") {
    throw new Error(`Rejected nonofficial URL: ${url}`);
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SaizeriyaOrderPersonalDataset/0.1 (low-rate personal use)", "Accept": "text/html,image/webp,image/jpeg,image/png,*/*" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const finalUrl = new URL(response.url);
      if (finalUrl.hostname !== "www.saizeriya.co.jp" || finalUrl.protocol !== "https:") {
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

function detectExtension(buffer) {
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "png";
  throw new Error("Unsupported image data");
}

async function imageFor(item) {
  if (!force) {
    for (const ext of ["webp", "jpg", "png"]) {
      const path = join(IMAGE_DIR, `${item.code}.${ext}`);
      try {
        if ((await stat(path)).size > 0) return `/images/${item.code}.${ext}`;
      } catch { /* Not cached */ }
    }
  }
  const response = await fetchOfficial(item.imageSource);
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > 5_000_000) throw new Error("Image too large");
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 5_000_000) throw new Error("Image too large");
  const ext = detectExtension(data);
  const path = join(IMAGE_DIR, `${item.code}.${ext}`);
  await mkdir(IMAGE_DIR, { recursive: true });
  await writeFile(path, data);
  return `/images/${item.code}.${ext}`;
}

async function loadExisting() {
  try {
    const json = JSON.parse(await readFile(DATA_PATH, "utf8"));
    if (!Array.isArray(json)) throw new Error("Invalid dataset");
    return new Map(json.filter((item) => /^\d{4}$/.test(item.code ?? "")).map((item) => [item.code, item]));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
}

async function main() {
  const listing = await (await fetchOfficial(LIST_URL)).text();
  const pages = extractMenuPageUrls(listing).slice(0, limit);
  if (!pages.length) throw new Error("No product detail links found: site structure may have changed.");

  const existing = await loadExisting();
  const failures = [];
  let fetched = 0;
  console.log(`Found ${pages.length} item pages${dryRun ? " (dry run)" : ""}.`);

  for (const pageUrl of pages) {
    const code = pageUrl.match(/\/(\d{4})\/$/)?.[1] ?? "????";
    try {
      const html = await (await fetchOfficial(pageUrl)).text();
      const detail = extractMenuDetail(html, pageUrl);
      if (!detail) throw new Error("No exact-code official product image or title found");
      const image = dryRun ? `/images/${code}.webp` : await imageFor(detail);
      if (!dryRun) existing.set(code, { code, name: detail.name, image, imageSource: detail.imageSource, pageUrl: detail.pageUrl });
      fetched++;
      console.log(`OK ${code} ${detail.name}`);
    } catch (error) {
      failures.push(`${code}: ${error.message}`);
      console.warn(`SKIP ${code}: ${error.message}`);
    }
    // Keep requests sequential and low-rate; do not parallel-scrape the site.
    await sleep(650);
  }
  if (!fetched) throw new Error("No menu items could be verified. Existing dataset was left unchanged.");

  if (!dryRun) {
    const data = [...existing.values()].sort((a, b) => a.code.localeCompare(b.code, "ja"));
    await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`Saved ${data.length} records to src/data/menu.json; images to public/images/ (gitignored).`);
  }
  console.log(`Finished: ${fetched} verified, ${failures.length} skipped.`);
  if (failures.length) console.log("Review skipped items and the existing manifest; not every menu item is covered.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
