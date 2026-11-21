import type { MenuItem } from "./menu";

export function getPlayableMenuItems<T extends Pick<MenuItem, "enabled" | "menuScope">>(
  items: readonly T[],
): T[];
