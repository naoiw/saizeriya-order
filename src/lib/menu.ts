import data from "../data/menu.json";

export type MenuItem = {
  code: string;
  name: string;
  image: string;
  imageSource: string;
  pageUrl: string;
};

export function validateMenuItems(input: unknown): MenuItem[] {
  if (!Array.isArray(input)) throw new Error("Menu dataset must be an array");
  const seen = new Set<string>();
  return input.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Invalid menu item at ${index}`);
    const value = item as Record<string, unknown>;
    if (
      typeof value.code !== "string" || !/^\d{4}$/.test(value.code) ||
      typeof value.name !== "string" || !value.name.trim() ||
      typeof value.image !== "string" || !/^\/images\/\d{4}\.(webp|jpg|png)$/.test(value.image) ||
      !value.image.startsWith(`/images/${value.code}.`) ||
      typeof value.imageSource !== "string" || !value.imageSource.startsWith("https://www.saizeriya.co.jp/files/") ||
      typeof value.pageUrl !== "string" || !value.pageUrl.startsWith("https://www.saizeriya.co.jp/menu-popular/")
    ) throw new Error(`Invalid menu data for item ${index}`);
    if (seen.has(value.code)) throw new Error(`Duplicate menu code: ${value.code}`);
    seen.add(value.code);
    return value as MenuItem;
  });
}

export const menuItems = validateMenuItems(data);
