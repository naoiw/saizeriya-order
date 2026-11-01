import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const items = JSON.parse(await readFile(join(root, "src/data/menu.json"), "utf8"));
if (!Array.isArray(items)) throw new Error("Menu dataset must be an array");
const seen = new Set();
let errors = 0;
for (const [index, item] of items.entries()) {
  try {
    if (!item || typeof item !== "object" ||
        typeof item.code !== "string" || !/^\d{4}$/.test(item.code) ||
        typeof item.name !== "string" || !item.name.trim()) {
      throw new Error("Missing or invalid code/name");
    }
    if (seen.has(item.code)) throw new Error("Duplicate code");
    seen.add(item.code);
    const imageUrl = new URL(item.imageSource);
    const pageUrl = new URL(item.pageUrl);
    const filename = decodeURIComponent(imageUrl.pathname.split("/").pop() ?? "");
    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "www.saizeriya.co.jp" ||
        !imageUrl.pathname.startsWith("/files/") ||
        !/\.(webp|png|jpe?g)$/i.test(filename) ||
        !(filename.startsWith(item.code + "_") || filename.startsWith(item.code + "-")) ||
        pageUrl.href !== "https://www.saizeriya.co.jp/menu-popular/" + item.code + "/") {
      throw new Error("Invalid official image or product page URL");
    }
    if ("image" in item) console.warn("WARN " + item.code + ": obsolete local image field");
  } catch (error) {
    errors++;
    console.error("ERROR row " + (index + 1) + " (" + (item?.code ?? "?") + "): " + error.message);
  }
}
console.log("Dataset: " + items.length + " entries, " + errors + " structural issue(s).");
if (items.length < 10) console.warn("WARN: fewer than 10 items; quiz needs at least 10.");
console.log("Check image display visually in the app. This script does not test live HTTP availability.");
if (errors) process.exitCode = 1;
