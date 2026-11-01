import assert from "node:assert/strict";
import test from "node:test";
import { drawGacha } from "../src/lib/gacha.mjs";

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
