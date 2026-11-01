/**
 * Pure gallery filtering and sorting. The source dataset is not mutated.
 */
export function filterAndSortMenu(items, query = "", sort = "code-asc") {
  const normalized = String(query).normalize("NFKC").trim().toLocaleLowerCase("ja");
  const filtered = items.filter((item) => {
    if (!normalized) return true;
    return (item.code + " " + item.name)
      .normalize("NFKC").toLocaleLowerCase("ja").includes(normalized);
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
