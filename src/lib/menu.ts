import data from "../data/menu.json";

export type MenuScope = "regular" | "morning" | "seasonal";
export type MenuItem = {
  code: string;
  name: string;
  imageSource?: string;
  pageUrl?: string;
  sourceUrl?: string;
  groupId?: string;
  variantLabel?: string;
  menuScope?: MenuScope;
  verification?: "reference";
  enabled?: boolean;
};

const variantPageIds: Record<string, string> = {
  "3901": "3201",
  "3906": "3206",
  "3401": "3401_0402",
  "3402": "3401_0402",
  "5102": "5101",
  "5103": "5101",
};

export function menuNotice(item: Pick<MenuItem, "menuScope" | "verification">): string | null {
  if (item.menuScope === "morning") return "朝サイゼ（一部店舗・時間限定）";
  if (item.menuScope === "seasonal") return "季節限定・現在の販売状況は要確認";
  if (item.verification === "reference") return "2026年2月のメニュー資料を基にした候補・現在の販売は要確認";
  return null;
}

export function isRegularGachaItem(
  item: Pick<MenuItem, "menuScope" | "verification" | "enabled">,
): boolean {
  return item.enabled !== false &&
    (item.menuScope === undefined || item.menuScope === "regular") &&
    item.verification !== "reference";
}

export function validateMenuItems(input: unknown): MenuItem[] {
  if (!Array.isArray(input)) throw new Error("Menu dataset must be an array");
  const seenCodes = new Set<string>();
  const seenGroups = new Map<string, MenuItem>();
  return input.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Invalid menu item at " + index);
    }
    const v = item as Record<string, unknown>;
    const { code, name, imageSource, pageUrl, sourceUrl, groupId, variantLabel,
      menuScope, verification, enabled } = v;
    if (typeof code !== "string" || !/^\d{4}$/.test(code) ||
        typeof name !== "string" || !name.trim() ||
        (imageSource !== undefined && (typeof imageSource !== "string" || !imageSource.trim())) ||
        (pageUrl !== undefined && (typeof pageUrl !== "string" || !pageUrl.trim())) ||
        (sourceUrl !== undefined && (typeof sourceUrl !== "string" || !sourceUrl.trim())) ||
        (pageUrl === undefined && sourceUrl === undefined) ||
        (groupId !== undefined && (typeof groupId !== "string" || !/^\d{4}$/.test(groupId))) ||
        (variantLabel !== undefined && (typeof variantLabel !== "string" || !variantLabel.trim())) ||
        (menuScope !== undefined && !["regular", "morning", "seasonal"].includes(String(menuScope))) ||
        (verification !== undefined && verification !== "reference") ||
        (enabled !== undefined && typeof enabled !== "boolean")) {
      throw new Error("Invalid menu record at " + index);
    }
    try {
      if (imageSource !== undefined) {
        const url = new URL(imageSource as string);
        if (url.protocol !== "https:" || url.hostname !== "www.saizeriya.co.jp" ||
            !/^\/files\/[^/]+\.(webp|png|jpe?g)$/i.test(url.pathname)) {
          throw new Error("Invalid official photo URL");
        }
      }
      if (pageUrl !== undefined) {
        const url = new URL(pageUrl as string);
        const id = variantPageIds[code] ?? code;
        const popular = "/menu-popular/" + id + "/";
        const allowed = url.pathname === popular ||
          (url.pathname === "/asasaize/" && menuScope === "morning");
        if (url.protocol !== "https:" || url.hostname !== "www.saizeriya.co.jp" ||
            url.search || url.hash || !allowed) {
          throw new Error("Unexpected official product page URL");
        }
      }
      if (sourceUrl !== undefined) {
        const url = new URL(sourceUrl as string);
        if (url.href !== "https://www.umenu.jp/menus/18.html") {
          throw new Error("Unexpected source URL");
        }
      }
    } catch {
      throw new Error("Invalid image or source URL for " + code);
    }
    if (seenCodes.has(code)) throw new Error("Duplicate menu code: " + code);
    seenCodes.add(code);

    const result: MenuItem = { code, name } as MenuItem;
    if (imageSource !== undefined) result.imageSource = imageSource as string;
    if (pageUrl !== undefined) result.pageUrl = pageUrl as string;
    if (sourceUrl !== undefined) result.sourceUrl = sourceUrl as string;
    if (groupId !== undefined) result.groupId = groupId as string;
    if (variantLabel !== undefined) result.variantLabel = variantLabel as string;
    if (menuScope !== undefined) result.menuScope = menuScope as MenuScope;
    if (verification !== undefined) result.verification = verification as "reference";
    if (enabled !== undefined) result.enabled = enabled as boolean;
    const key = result.groupId ?? result.code;
    const existing = seenGroups.get(key);
    if (existing) {
      if (!result.groupId || !existing.groupId ||
          !result.variantLabel || !existing.variantLabel ||
          existing.name !== result.name ||
          existing.imageSource !== result.imageSource ||
          existing.pageUrl !== result.pageUrl ||
          existing.sourceUrl !== result.sourceUrl ||
          (existing.menuScope ?? "regular") !== (result.menuScope ?? "regular") ||
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
