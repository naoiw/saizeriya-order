import assert from "node:assert/strict";
import test from "node:test";
import { drawGacha, getGachaCandidates } from "../src/lib/gacha.mjs";
import { readFile } from "node:fs/promises";

const dishes = [
  { code: "1001", name: "A" },
  { code: "1002", name: "B" },
  { code: "1003", name: "C" },
];

test("draws exactly five items by default with replacement", () => {
  const before = structuredClone(dishes);
  const picked = drawGacha(dishes, undefined, () => 0);
  assert.equal(picked.length, 5);
  assert.deepEqual(picked.map((item) => item.code), Array(5).fill("1001"));
  assert.deepEqual(dishes, before);
});

test("draws in sequence from supplied random values", () => {
  const sequence = [0, 0.4, 0.8, 0.4, 0.99];
  let position = 0;
  const chosen = drawGacha(dishes, 5, () => sequence[position++]);
  assert.deepEqual(chosen.map((item) => item.code), [
    "1001", "1002", "1003", "1002", "1003",
  ]);
});

test("never repeats an identical full draw when another item exists", () => {
  const prior = Array(5).fill("1001");
  const next = drawGacha(dishes, 5, () => 0, prior);
  assert.equal(next.length, 5);
  assert.notDeepEqual(next.map((item) => item.code), prior);
  assert.equal(next[0].code, "1002");
  assert.deepEqual(next.slice(1).map((item) => item.code), prior.slice(1));
});

test("allows a repeat if there is only one possible item", () => {
  const chosen = drawGacha(dishes.slice(0, 1), 5, () => 0, Array(5).fill("1001"));
  assert.equal(chosen.length, 5);
});

test("rejects empty data, invalid counts and random values", () => {
  assert.throws(() => drawGacha([]), RangeError);
  assert.throws(() => drawGacha(dishes, 0), RangeError);
  assert.throws(() => drawGacha(dishes, 2.5), RangeError);
  for (const invalid of [-0.1, 1, NaN, Infinity]) {
    assert.throws(() => drawGacha(dishes, 5, () => invalid), RangeError);
  }
});

const registeredMenu = JSON.parse(await readFile(
  new URL("../src/data/menu.json", import.meta.url), "utf8",
));

test("gacha includes all 114 enabled quiz codes, including 80 without images", () => {
  const before = structuredClone(registeredMenu);
  const eligible = getGachaCandidates(registeredMenu);
  assert.equal(eligible.length, 114);
  assert.equal(eligible.filter((item) => !item.imageSource).length, 80);
  assert.deepEqual(eligible.map((item) => item.code), registeredMenu.map((item) => item.code));
  assert.deepEqual(registeredMenu, before);
});

test("historical, breakfast and seasonal text-only items can all be drawn", () => {
  const eligible = getGachaCandidates(registeredMenu);
  for (const code of ["3301", "3403", "5102", "5605", "1302"]) {
    const index = eligible.findIndex((item) => item.code === code);
    assert.ok(index >= 0, code + " must be available to the gacha");
    const selected = drawGacha(eligible, 5, () => (index + 0.5) / eligible.length);
    assert.deepEqual(selected.map((item) => item.code), Array(5).fill(code));
    assert.ok(selected.every((item) => !item.imageSource), code + " should show 画像なし");
  }
});

test("only explicitly disabled items are excluded from the gacha", () => {
  const eligible = getGachaCandidates([
    { code: "0001", enabled: false, name: "disabled" },
    { code: "0002", verification: "reference", name: "past menu" },
    { code: "0003", menuScope: "morning", name: "breakfast" },
    { code: "0004", menuScope: "seasonal", name: "seasonal" },
    { code: "0005", name: "regular" },
  ]);
  assert.deepEqual(eligible.map((item) => item.code), ["0002", "0003", "0004", "0005"]);
});
