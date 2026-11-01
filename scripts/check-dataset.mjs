import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const items = JSON.parse(await readFile(join(root, "src/data/menu.json"), "utf8"));
if (!Array.isArray(items)) throw new Error("Menu dataset must be an array");
const seen = new Set();
const groups = new Map();
const pageVariants = { "3901": "3201", "3906": "3206", "3401": "3401_0402", "3402": "3401_0402" };
let errors = 0;
let enabled = 0;
for (const [index, item] of items.entries()) {
  try {
    if (!item || typeof item !== "object" ||
        typeof item.code !== "string" || !/^\d{4}$/.test(item.code) ||
        typeof item.name !== "string" || !item.name.trim() ||
        (item.groupId !== undefined && (typeof item.groupId !== "string" || !/^\d{4}$/.test(item.groupId))) ||
        (item.variantLabel !== undefined && (typeof item.variantLabel !== "string" || !item.variantLabel.trim())) ||
        (item.enabled !== undefined && typeof item.enabled !== "boolean")) {
      throw new Error("Missing or invalid fields");
    }
    if (seen.has(item.code)) throw new Error("Duplicate code");
    seen.add(item.code);
    const imageUrl = new URL(item.imageSource);
    const pageUrl = new URL(item.pageUrl);
    const pageId = pageVariants[item.code] ?? item.code;
    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "www.saizeriya.co.jp" ||
        !/^\/files\/[^/]+\.(webp|png|jpe?g)$/i.test(imageUrl.pathname) ||
        pageUrl.href !== "https://www.saizeriya.co.jp/menu-popular/" + pageId + "/") {
      throw new Error("Invalid official image or product page URL");
    }
    const key = item.groupId ?? item.code;
    const existing = groups.get(key);
    if (existing &&
        (!item.groupId || !existing.groupId || !item.variantLabel || !existing.variantLabel ||
          item.name !== existing.name || item.imageSource !== existing.imageSource ||
          item.pageUrl !== existing.pageUrl ||
          (item.enabled === false) !== (existing.enabled === false))) {
      throw new Error("Grouped variants must share name, page, photo and visibility");
    }
    groups.set(key, existing ?? item);
    if (item.enabled !== false) enabled++;
  } catch (error) {
    errors++;
    console.error("ERROR row " + (index + 1) + " (" + (item?.code ?? "?") + "): " + error.message);
  }
}
console.log("Dataset: " + items.length + " order codes, " + enabled +
            " enabled quiz questions, " + groups.size + " gallery groups, " + errors + " issue(s).");
if (enabled < 10) console.warn("WARN: fewer than 10 available questions.");
console.log("Live photo availability and visual correctness still require browser inspection.");
if (errors) process.exitCode = 1;
