/** Shared eligibility for the quiz and gacha. The gallery retains all records. */
export function getPlayableMenuItems(items) {
  return items.filter((item) =>
    item.enabled !== false && (item.menuScope === undefined || item.menuScope === "regular"));
}
