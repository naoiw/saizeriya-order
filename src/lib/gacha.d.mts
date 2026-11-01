import type { MenuItem } from "./menu";

export function drawGacha<T extends Pick<MenuItem, "code">>(
  items: readonly T[],
  count?: number,
  random?: () => number,
  previousCodes?: readonly string[],
): T[];
