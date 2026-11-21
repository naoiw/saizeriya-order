import test from "node:test";
import assert from "node:assert/strict";
import { filterAndSortMenu, groupMenuItems } from "../src/lib/gallery.mjs";

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

test("groups dessert serving-time variants and glass wine color variants", () => {
  const samples = [
    { code: "3201", name: "ティラミス", groupId: "3201", variantLabel: "すぐに", imageSource: "photo1", pageUrl: "page1" },
    { code: "3901", name: "ティラミス", groupId: "3201", variantLabel: "あとで", imageSource: "photo1", pageUrl: "page1" },
    { code: "3401", name: "グラスワイン", groupId: "3401", variantLabel: "赤", imageSource: "photo2", pageUrl: "page2" },
    { code: "3402", name: "グラスワイン", groupId: "3401", variantLabel: "白", imageSource: "photo2", pageUrl: "page2" },
  ];
  const groups = groupMenuItems(samples);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].codes, [
    {code: "3201",label:"すぐに"},
    {code: "3901",label:"あとで"},
  ]);
  assert.deepEqual(groups[1].codes, [
    {code:"3401",label:"赤"},
    {code:"3402",label:"白"},
  ]);
  assert.equal(filterAndSortMenu(groups, "3901").length, 1);
  assert.equal(filterAndSortMenu(groups, "３４０２")[0].name, "グラスワイン");
  assert.equal(filterAndSortMenu(groups, "あとで").length, 1);
  assert.equal(samples.length, 4);
});

test("groups text-only menu entries and propagates reference status", () => {
  const inputs = [
    { code: "5101", name: "ドリンクバー", groupId: "5101",
      variantLabel: "セット", pageUrl: "https://www.saizeriya.co.jp/menu-popular/5101/" },
    { code: "5102", name: "ドリンクバー", groupId: "5101", variantLabel: "キッズ",
      verification: "reference", pageUrl: "https://www.saizeriya.co.jp/menu-popular/5101/" },
    { code: "5103", name: "ドリンクバー", groupId: "5101", variantLabel: "単品",
      verification: "reference", pageUrl: "https://www.saizeriya.co.jp/menu-popular/5101/" },
  ];
  const groups = groupMenuItems(inputs);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].imageSource, undefined);
  assert.equal(groups[0].codes.length, 3);
  assert.equal(groups[0].verification, "reference");
  assert.equal(filterAndSortMenu(groups, "５１０２").length, 1);
});
