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

test("prefers official main image over numbered ranking images", () => {
  const html = '<title>アロスティチーニ | サイゼリヤ</title>' +
    '<meta property="og:image" content="https://www.saizeriya.co.jp/files/%E3%82%A2%E3%83%AD%E3%82%B9%E3%83%86%E3%82%A3%E3%83%81%E3%83%BC%E3%83%8B.webp">' +
    '<img src="/files/1402_rank.webp">';
  assert.equal(
    extractMenuDetail(html, "https://www.saizeriya.co.jp/menu-popular/1402/")?.imageSource,
    "https://www.saizeriya.co.jp/files/%E3%82%A2%E3%83%AD%E3%82%B9%E3%83%86%E3%82%A3%E3%83%81%E3%83%BC%E3%83%8B.webp",
  );
});

test("rejects ranking-only pages instead of treating ranking graphic as dish photo", () => {
  const html = '<title>パルマ風スパゲッティ | サイゼリヤ</title>' +
    '<img src="/files/2304_rank.webp"><img src="/files/2304_comb.webp">';
  assert.equal(extractMenuDetail(html, "https://www.saizeriya.co.jp/menu-popular/2304/"), null);
});

test("does not accept an untrusted social image URL", () => {
  const html = '<title>アロスティチーニ | サイゼリヤ</title>' +
    '<meta content="https://evil.example/files/アロスティチーニ.webp" property="og:image">';
  assert.equal(extractMenuDetail(html, "https://www.saizeriya.co.jp/menu-popular/1402/"), null);
});
