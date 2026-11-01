import data from "../data/menu.json";

export type MenuItem = {
  code: string;
  name: string;
  imageSource: string;
  pageUrl: string;
  groupId?: string;
  variantLabel?: string;
  enabled?: boolean;
};

// These variants share a primary product page, not their own code-specific URL.
const variantPageIds: Record<string, string> = {
  "3901": "3201",
  "3906": "3206",
  "3401": "3401_0402",
  "3402": "3401_0402",
};

export function validateMenuItems(input: unknown): MenuItem[] {
  if (!Array.isArray(input)) throw new Error("Menu dataset must be an array");
  const seenCodes = new Set<string>();
  const seenGroups = new Map<string, MenuItem>();
  return input.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("Invalid menu item at " + index);
    const value = item as Record<string, unknown>;
    const { code, name, imageSource, pageUrl, groupId, variantLabel, enabled } = value;
    if (typeof code !== "string" || !/^\d{4}$/.test(code) ||
        typeof name !== "string" || !name.trim() ||
        typeof imageSource !== "string" || typeof pageUrl !== "string" ||
        (groupId !== undefined && (typeof groupId !== "string" || !/^\d{4}$/.test(groupId))) ||
        (variantLabel !== undefined && (typeof variantLabel !== "string" || !variantLabel.trim())) ||
        (enabled !== undefined && typeof enabled !== "boolean")) {
      throw new Error("Invalid menu record at " + index);
    }
    let imageUrl: URL;
    let productUrl: URL;
    try {
      imageUrl = new URL(imageSource);
      productUrl = new URL(pageUrl);
    } catch {
      throw new Error("Invalid URL for " + code);
    }
    const expectedPageId = variantPageIds[code] ?? code;
    if (imageUrl.protocol !== "https:" ||
        imageUrl.hostname !== "www.saizeriya.co.jp" ||
        !/^\/files\/[^/]+\.(webp|png|jpe?g)$/i.test(imageUrl.pathname) ||
        productUrl.href !== "https://www.saizeriya.co.jp/menu-popular/" + expectedPageId + "/") {
      throw new Error("Unexpected official image/page URL for " + code);
    }
    if (seenCodes.has(code)) throw new Error("Duplicate menu code: " + code);
    seenCodes.add(code);
    const result: MenuItem = { code, name, imageSource, pageUrl };
    if (groupId !== undefined) result.groupId = groupId;
    if (variantLabel !== undefined) result.variantLabel = variantLabel;
    if (enabled !== undefined) result.enabled = enabled;
    const key = result.groupId ?? result.code;
    const existing = seenGroups.get(key);
    if (existing) {
      if (!result.groupId || !existing.groupId ||
          !result.variantLabel || !existing.variantLabel ||
          existing.name !== result.name || existing.imageSource !== result.imageSource ||
          existing.pageUrl !== result.pageUrl ||
          (existing.enabled === false) !== (result.enabled === false)) {
        throw new Error("Inconsistent grouped menu item: " + code);
      }
    } else {
      seenGroups.set(key, result);
    }
    return result;
  });
}

export const menuItems = validateMenuItems(data);
