import type { MenuItem } from "./menu";

export function getGachaCandidates<T extends Pick<MenuItem, "enabled">>(items: readonly T[]): T[];

export function drawGacha<T extends Pick<MenuItem, "code">>(
  items: readonly T[],
  count?: number,
  random?: () => number,
  previousCodes?: readonly string[],
): T[];
