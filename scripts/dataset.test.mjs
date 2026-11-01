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

test("wrong photographs have been replaced and drink bar remains disabled", () => {
  for (const code of ["1402","2304"]) {
    assert.doesNotMatch(byCode.get(code).imageSource, /_rank\.webp$/);
  }
  assert.equal(byCode.get("5101").enabled,false);
  assert.equal(active.some(x=>x.code==="5101"),false);
});

test("total active question and gallery group counts stay consistent", () => {
  assert.equal(items.length,35);
  assert.equal(active.length,34);
  assert.equal(groupMenuItems(active).length,31);
});
