import type { MenuItem } from "./menu";
export type GallerySort = "code-asc" | "code-desc" | "name-asc" | "name-desc";
export type GalleryItem = Pick<MenuItem, "code" | "name" | "imageSource" | "pageUrl"> & {
  groupId: string;
  codes: { code: string; label: string }[];
};
export function groupMenuItems(items: readonly MenuItem[]): GalleryItem[];
export function filterAndSortMenu<T extends Pick<MenuItem, "code" | "name"> & {
  codes?: readonly { code: string; label: string }[];
}>(
  items: readonly T[],
  query?: string,
  sort?: GallerySort,
): T[];
