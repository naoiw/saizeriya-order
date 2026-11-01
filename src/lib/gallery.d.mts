import type { MenuItem } from "./menu";
export type GallerySort = "code-asc" | "code-desc" | "name-asc" | "name-desc";
export function filterAndSortMenu<T extends Pick<MenuItem, "code" | "name">>(
  items: readonly T[],
  query?: string,
  sort?: GallerySort,
): T[];
