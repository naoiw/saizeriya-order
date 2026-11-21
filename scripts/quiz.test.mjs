import assert from "node:assert/strict";
import test from "node:test";
import { appendDigit, backspaceDigit, pickQuestions, scoreResults } from "../src/lib/quiz.mjs";
import { getPlayableMenuItems } from "../src/lib/menu-availability.mjs";
import { readFile } from "node:fs/promises";

const menu = Array.from({ length: 31 }, (_, index) => ({
  code: String(index + 1000),
  name: "Dish " + index,
}));

test("selects five unique questions by default and leaves the source unchanged", () => {
  const original = structuredClone(menu);
  const selected = pickQuestions(menu, undefined, () => 0.5);
  assert.equal(selected.length, 5);
  assert.equal(new Set(selected.map((item) => item.code)).size, 5);
  assert.deepEqual(menu, original);
  assert.ok(selected.every((item) => menu.includes(item)));
});

test("supports rerolls, without repeating questions in one round", () => {
  const first = pickQuestions(menu, 5, () => 0);
  const second = pickQuestions(menu, 5, () => 0.99);
  assert.notDeepEqual(first.map((item) => item.code), second.map((item) => item.code));
});

test("cannot start with too few distinct questions", () => {
  assert.throws(() => pickQuestions(menu.slice(0, 4), 5), RangeError);
  assert.throws(() => pickQuestions([menu[0], menu[0]], 2), RangeError);
  assert.throws(() => pickQuestions(menu, 0), RangeError);
});

test("input only accepts four digits and supports deletion", () => {
  let answer = "";
  for (const digit of ["1", "0", "0", "2", "7"]) answer = appendDigit(answer, digit);
  assert.equal(answer, "1002");
  assert.equal(appendDigit(answer, "x"), answer);
  assert.equal(backspaceDigit(answer), "100");
  assert.equal(backspaceDigit(""), "");
});

test("score ignores incorrect and skipped answers", () => {
  assert.equal(scoreResults([
    { isCorrect: true }, { isCorrect: false }, { isCorrect: false },
    { isCorrect: true }, { isCorrect: false },
  ]), 2);
});

test("the real 114-code catalog yields 105 normal-menu quiz candidates", async () => {
  const all = JSON.parse(await readFile(new URL("../src/data/menu.json", import.meta.url), "utf8"));
  const eligible = getPlayableMenuItems(all);
  assert.equal(all.length, 114);
  assert.equal(eligible.length, 105);
  assert.ok(eligible.some((item) => item.code === "3301" && !item.imageSource));
  assert.ok(eligible.every((item) => item.menuScope === undefined || item.menuScope === "regular"));
  const selected = pickQuestions(eligible, 5, () => 0.5);
  assert.equal(selected.length, 5);
  assert.equal(new Set(selected.map((item) => item.code)).size, 5);
});
