import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { groupMenuItems } from "../src/lib/gallery.mjs";

const items = JSON.parse(await readFile(new URL("../src/data/menu.json", import.meta.url), "utf8"));
const byCode = new Map(items.map((entry) => [entry.code, entry]));
const active = items.filter((entry) => entry.enabled !== false);

test("exactly one record per quiz code and distinct dessert timing questions", () => {
  assert.equal(byCode.size, items.length);
  for (const [immediate, delayed] of [["3201","3901"],["3206","3906"]]) {
    assert.equal(byCode.get(immediate).variantLabel,"すぐに");
    assert.equal(byCode.get(delayed).variantLabel,"あとで");
    assert.equal(byCode.get(immediate).groupId,immediate);
    assert.equal(byCode.get(delayed).groupId,immediate);
    assert.equal(byCode.get(immediate).imageSource, byCode.get(delayed).imageSource);
  }
});

test("red and white glass wines share a verified official photo and gallery card", () => {
  assert.equal(byCode.get("3401").variantLabel, "赤");
  assert.equal(byCode.get("3402").variantLabel, "白");
  assert.equal(byCode.get("3401").imageSource, byCode.get("3402").imageSource);
  assert.match(byCode.get("3401").imageSource, /PC_.*\.webp$/);
  assert.equal(byCode.get("3401").pageUrl, "https://www.saizeriya.co.jp/menu-popular/3401_0402/");
  assert.equal(groupMenuItems(active).filter(x=>x.groupId==="3401").length,1);
});

test("incorrect photographs were replaced, and drink bar is playable without a photo", () => {
  for (const code of ["1402","2304"]) {
    assert.doesNotMatch(byCode.get(code).imageSource, /_rank\.webp$/);
  }
  assert.notEqual(byCode.get("5101").enabled, false);
  assert.equal(byCode.get("5101").imageSource, undefined);
  assert.equal(byCode.get("5101").variantLabel, "セット");
  assert.equal(active.some(x=>x.code==="5101"),true);
});

test("total active question and gallery group counts stay consistent", () => {
  assert.equal(items.length,114);
  assert.equal(active.length,114);
  assert.equal(groupMenuItems(active).length,93);
});

test("all 70 reference-list codes and 8 official breakfast codes are present", () => {
  const references = items.filter((x) => x.menuScope === "regular" && x.verification === "reference");
  const morning = items.filter((x) => x.menuScope === "morning");
  const seasonal = items.filter((x) => x.menuScope === "seasonal");
  assert.equal(references.length, 70);
  assert.equal(morning.length, 8);
  assert.equal(seasonal.length, 1);
  assert.equal(byCode.get("3301").name, "生ビール キリン一番搾り");
  assert.equal(byCode.get("3301").variantLabel, "ジョッキ");
  assert.equal(byCode.get("3302").variantLabel, "グラス");
  assert.equal(byCode.get("5605").name, "焼きシナモンフォッカチオ");
  assert.equal(byCode.get("1302").name, "冷たいパンプキンスープ");
  for (const code of ["3301", "3403", "3110", "2103", "2306", "3101", "3212", "5605", "1302"]) {
    assert.ok(byCode.has(code), code + " must be included");
  }
});

test("text-only entries remain active and have traceable source links", () => {
  const noImage = items.filter((x) => !x.imageSource);
  assert.equal(noImage.length, 80);
  assert.equal(items.filter((x) => x.imageSource).length, 34);
  assert.ok(noImage.every((x) => x.enabled !== false));
  assert.ok(noImage.every((x) => typeof (x.pageUrl ?? x.sourceUrl) === "string"));
  assert.equal(byCode.get("5101").pageUrl, "https://www.saizeriya.co.jp/menu-popular/5101/");
});

test("all question labels are unambiguous even without photographs", () => {
  const display = items.map((x) => x.name + "／" + (x.variantLabel ?? ""));
  assert.equal(new Set(display).size, items.length);
  const grouped = groupMenuItems(active);
  const variants = grouped.find((x) => x.groupId === "3212");
  assert.deepEqual(variants.codes, [
    { code: "3212", label: "すぐに" },
    { code: "3912", label: "あとで" },
  ]);
  assert.equal(variants.imageSource, undefined);
  const morning = grouped.find((x) => x.groupId === "5605");
  assert.equal(morning.codes.length, 3);
  const drinkBar = grouped.find((x) => x.groupId === "5101");
  assert.equal(drinkBar.codes.length, 3);
});
