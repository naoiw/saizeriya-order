import test from "node:test";
import assert from "node:assert/strict";
import { filterAndSortMenu } from "../src/lib/gallery.mjs";

const dataset = [
  { code: "2101", name: "ミラノ風ドリア" },
  { code: "1202", name: "小エビのサラダ" },
  { code: "2305", name: "カルボナーラ" },
  { code: "1401", name: "辛味チキン" },
];

test("code sorting is numeric-like but preserves code strings", () => {
  assert.deepEqual(filterAndSortMenu(dataset).map((x) => x.code), [
    "1202", "1401", "2101", "2305",
  ]);
  assert.deepEqual(filterAndSortMenu(dataset, "", "code-desc").map((x) => x.code), [
    "2305", "2101", "1401", "1202",
  ]);
});

test("searches by product number, name and fullwidth digits", () => {
  assert.deepEqual(filterAndSortMenu(dataset, "２１０１").map((x) => x.name), ["ミラノ風ドリア"]);
  assert.deepEqual(filterAndSortMenu(dataset, " 小エビ ").map((x) => x.code), ["1202"]);
  assert.deepEqual(filterAndSortMenu(dataset, "存在しない"), []);
});

test("sorts by Japanese names without changing source", () => {
  const original = structuredClone(dataset);
  const ascending = filterAndSortMenu(dataset, "", "name-asc");
  const descending = filterAndSortMenu(dataset, "", "name-desc");
  assert.equal(ascending.length, dataset.length);
  assert.deepEqual(ascending.map((i) => i.name), [...descending].reverse().map((i) => i.name));
  assert.deepEqual(dataset, original);
  assert.throws(() => filterAndSortMenu(dataset, "", "unsupported"));
});
