import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const items = JSON.parse(await readFile(join(root, "src/data/menu.json"), "utf8"));
if (!Array.isArray(items)) throw new Error("Menu dataset must be an array");
const seen = new Set();
const groups = new Map();
const pageVariants = { "3901": "3201", "3906": "3206", "3401": "3401_0402", "3402": "3401_0402", "5102": "5101", "5103": "5101" };
let errors = 0;
let enabled = 0;
let missingImages = 0;
for (const [index, item] of items.entries()) {
  try {
    if (!item || typeof item !== "object" || Array.isArray(item) ||
        typeof item.code !== "string" || !/^\\d{4}$/.test(item.code) ||
        typeof item.name !== "string" || !item.name.trim() ||
        (item.imageSource !== undefined && (typeof item.imageSource !== "string" || !item.imageSource.trim())) ||
        (item.pageUrl !== undefined && (typeof item.pageUrl !== "string" || !item.pageUrl.trim())) ||
        (item.sourceUrl !== undefined && (typeof item.sourceUrl !== "string" || !item.sourceUrl.trim())) ||
        (item.pageUrl === undefined && item.sourceUrl === undefined) ||
        (item.groupId !== undefined && (typeof item.groupId !== "string" || !/^\\d{4}$/.test(item.groupId))) ||
        (item.variantLabel !== undefined && (typeof item.variantLabel !== "string" || !item.variantLabel.trim())) ||
        (item.menuScope !== undefined && !["regular", "morning", "seasonal"].includes(item.menuScope)) ||
        (item.verification !== undefined && item.verification !== "reference") ||
        (item.enabled !== undefined && typeof item.enabled !== "boolean")) {
      throw new Error("Missing or invalid fields");
    }
    if (seen.has(item.code)) throw new Error("Duplicate code");
    seen.add(item.code);
    if (item.imageSource !== undefined) {
      const img = new URL(item.imageSource);
      if (img.protocol !== "https:" || img.hostname !== "www.saizeriya.co.jp" ||
          !/^\\/files\\/[^/]+\\.(webp|png|jpe?g)$/i.test(img.pathname)) {
        throw new Error("Invalid official image URL");
      }
    } else {
      missingImages++;
    }
    if (item.pageUrl !== undefined) {
      const page = new URL(item.pageUrl);
      const id = pageVariants[item.code] ?? item.code;
      const allowed = page.pathname === "/menu-popular/" + id + "/" ||
        (page.pathname === "/asasaize/" && item.menuScope === "morning");
      if (page.protocol !== "https:" || page.hostname !== "www.saizeriya.co.jp" ||
          page.search || page.hash || !allowed) {
        throw new Error("Invalid official product page URL");
      }
    }
    if (item.sourceUrl !== undefined &&
        new URL(item.sourceUrl).href !== "https://www.umenu.jp/menus/18.html") {
      throw new Error("Invalid reference URL");
    }
    const key = item.groupId ?? item.code;
    const existing = groups.get(key);
    if (existing &&
        (!item.groupId || !existing.groupId || !item.variantLabel || !existing.variantLabel ||
          item.name !== existing.name || item.imageSource !== existing.imageSource ||
          item.pageUrl !== existing.pageUrl || item.sourceUrl !== existing.sourceUrl ||
          (item.menuScope ?? "regular") !== (existing.menuScope ?? "regular") ||
          (item.enabled === false) !== (existing.enabled === false))) {
      throw new Error("Grouped variants must share name, sources, photo and visibility");
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
if (enabled < 5) console.warn("WARN: fewer than 10 available questions.");
console.log("Missing verified images: " + missingImages + ". These entries remain playable with a text-only placeholder.");
console.log("Live photo availability and visual correctness still require browser inspection.");
if (errors) process.exitCode = 1;
