/**
 * Convert question-level records into a one-card-per-product gallery.
 * Shared photos and page links are displayed once, while variants retain
 * individually labelled order codes.
 */
export function groupMenuItems(items) {
  const groups = new Map();
  for (const item of items) {
    const groupId = item.groupId ?? item.code;
    if (!groups.has(groupId)) groups.set(groupId, {
      code: item.code,
      groupId,
      name: item.name,
      imageSource: item.imageSource,
      pageUrl: item.pageUrl,
      sourceUrl: item.sourceUrl,
      menuScope: item.menuScope,
      verification: item.verification,
      codes: [],
    });
    const entry = groups.get(groupId);
    if (item.verification === "reference") entry.verification = "reference";
    entry.codes.push({ code: item.code, label: item.variantLabel ?? "" });
  }
  return [...groups.values()];
}

/** Search across all variant codes and labels and sort on the primary code. */
export function filterAndSortMenu(items, query = "", sort = "code-asc") {
  const normalized = String(query).normalize("NFKC").trim().toLocaleLowerCase("ja");
  const filtered = items.filter((item) => {
    if (!normalized) return true;
    const tokens = [item.code, item.name, ...(item.codes ?? []).flatMap((entry) => [entry.code, entry.label])];
    return tokens.join(" ").normalize("NFKC").toLocaleLowerCase("ja").includes(normalized);
  });
  const byCode = (a, b) => a.code.localeCompare(b.code, "ja");
  const byName = (a, b) => a.name.localeCompare(b.name, "ja");
  const comparator = {
    "code-asc": byCode,
    "code-desc": (a, b) => -byCode(a, b),
    "name-asc": (a, b) => byName(a, b) || byCode(a, b),
    "name-desc": (a, b) => -byName(a, b) || byCode(a, b),
  }[sort];
  if (!comparator) throw new Error("Unknown gallery sort: " + sort);
  return filtered.sort(comparator);
}
