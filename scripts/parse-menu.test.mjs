import test from "node:test";
import assert from "node:assert/strict";
import { decodeHtml, extractMenuPageUrls, extractMenuDetail } from "./parse-menu.mjs";

test("deduplicates only real four-digit product pages", () => {
  const html = [
    '<a href="/menu-popular/2101/">doria</a>',
    '<a href="https://www.saizeriya.co.jp/menu-popular/1401/">chicken</a>',
    '<a href="/menu-popular/2101/">doria repeated</a>',
    '<a href="/menu-popular/">index</a>',
    '<a href="https://evil.example/menu-popular/9999/">external</a>',
  ].join("");
  assert.deepEqual(extractMenuPageUrls(html), [
    "https://www.saizeriya.co.jp/menu-popular/2101/",
    "https://www.saizeriya.co.jp/menu-popular/1401/",
  ]);
});

test("extracts product name and exact code-matched photo", () => {
  const html = '<title>ミラノ風ドリア | サイゼリヤ</title>' +
    '<img src="/files/logo.webp">' +
    '<img src="/files/1202_other.webp">' +
    '<img srcset="/files/2101_%E3%83%89%E3%83%AA%E3%82%A2.webp 1x, /files/2101_extra.webp 2x">';
  assert.deepEqual(extractMenuDetail(html, "https://www.saizeriya.co.jp/menu-popular/2101/"), {
    code: "2101",
    name: "ミラノ風ドリア",
    pageUrl: "https://www.saizeriya.co.jp/menu-popular/2101/",
    imageSource: "https://www.saizeriya.co.jp/files/2101_%E3%83%89%E3%83%AA%E3%82%A2.webp",
  });
});

test("does not guess an unrelated image", () => {
  assert.equal(
    extractMenuDetail('<title>辛味チキン | サイゼリヤ</title><img src="/files/logo.webp">', "https://www.saizeriya.co.jp/menu-popular/1401/"),
    null,
  );
});

test("decodes Japanese title entities without damaging names", () => {
  assert.equal(decodeHtml("トマト&amp;チーズ&#x30FB;パン"), "トマト&チーズ・パン");
});
