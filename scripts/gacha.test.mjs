import assert from "node:assert/strict";
import test from "node:test";
import { drawGacha, getGachaCandidates } from "../src/lib/gacha.mjs";
import { getPlayableMenuItems } from "../src/lib/menu-availability.mjs";
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


test("quiz and gacha use the same 105 regular menu codes, including image-less entries", () => {
  const original = structuredClone(registeredMenu);
  const eligible = getGachaCandidates(registeredMenu);
  const quizEligible = getPlayableMenuItems(registeredMenu);
  assert.equal(eligible.length, 105);
  assert.equal(eligible.filter((item) => !item.imageSource).length, 71);
  assert.deepEqual(eligible, quizEligible);
  assert.equal(eligible.filter((item) => item.verification === "reference").length, 70);
  assert.deepEqual(registeredMenu, original);
});

test("regular photo-less items can be selected while limited menus cannot", () => {
  const eligible = getGachaCandidates(registeredMenu);
  for (const code of ["3301", "3403", "5101", "5102", "3101"]) {
    const index = eligible.findIndex((item) => item.code === code);
    assert.ok(index >= 0, code + " must be available");
    const picked = drawGacha(eligible, 5, () => (index + 0.5) / eligible.length);
    assert.deepEqual(picked.map((item) => item.code), Array(5).fill(code));
    assert.ok(picked.every((item) => !item.imageSource), code + " shows image-less placeholder");
  }
  for (const code of ["1302", "5605", "5606", "5627"]) {
    assert.ok(!eligible.some((item) => item.code === code), code + " must be excluded");
  }
});

test("disabled, morning, seasonal and store-limited records are excluded", () => {
  const input = [
    { code: "0001", enabled: false, name: "disabled" },
    { code: "0002", verification: "reference", name: "past regular menu" },
    { code: "0003", menuScope: "morning", name: "breakfast" },
    { code: "0004", menuScope: "seasonal", name: "seasonal" },
    { code: "0005", menuScope: "store", name: "store exclusive" },
    { code: "0006", menuScope: "regular", name: "regular" },
    { code: "0007", name: "no image" },
  ];
  assert.deepEqual(getPlayableMenuItems(input).map((x) => x.code), ["0002", "0006", "0007"]);
  assert.deepEqual(getGachaCandidates(input), getPlayableMenuItems(input));
});
