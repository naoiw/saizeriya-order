import data from "../data/menu.json";

export type MenuItem = {
  code: string;
  name: string;
  imageSource: string;
  pageUrl: string;
};

export function validateMenuItems(input: unknown): MenuItem[] {
  if (!Array.isArray(input)) throw new Error("Menu dataset must be an array");
  const seen = new Set<string>();
  return input.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("Invalid menu item at " + index);
    const value = item as Record<string, unknown>;
    if (typeof value.code !== "string" || !/^\d{4}$/.test(value.code) ||
        typeof value.name !== "string" || !value.name.trim() ||
        typeof value.imageSource !== "string" ||
        typeof value.pageUrl !== "string") {
      throw new Error("Invalid menu record at " + index);
    }
    let imageUrl: URL;
    let pageUrl: URL;
    try {
      imageUrl = new URL(value.imageSource);
      pageUrl = new URL(value.pageUrl);
    } catch {
      throw new Error("Invalid URL for " + value.code);
    }
    const filename = decodeURIComponent(imageUrl.pathname.split("/").pop() ?? "");
    if (imageUrl.protocol !== "https:" ||
        imageUrl.hostname !== "www.saizeriya.co.jp" ||
        !imageUrl.pathname.startsWith("/files/") ||
        !/\.(webp|png|jpe?g)$/i.test(filename) ||
        !(filename.startsWith(value.code + "_") || filename.startsWith(value.code + "-")) ||
        pageUrl.href !== "https://www.saizeriya.co.jp/menu-popular/" + value.code + "/") {
      throw new Error("Unexpected official image/page URL for " + value.code);
    }
    if (seen.has(value.code)) throw new Error("Duplicate menu code: " + value.code);
    seen.add(value.code);
    return {
      code: value.code,
      name: value.name,
      imageSource: value.imageSource,
      pageUrl: value.pageUrl,
    };
  });
}

export const menuItems = validateMenuItems(data);
