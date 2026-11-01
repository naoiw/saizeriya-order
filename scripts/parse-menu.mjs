const BASE_URL = "https://www.saizeriya.co.jp";

export function decodeHtml(text) {
  const entities = {amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " "};
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, key) => {
    if (key[0] === "#") {
      const value = key[1].toLowerCase() === "x"
        ? Number.parseInt(key.slice(2), 16)
        : Number.parseInt(key.slice(1), 10);
      return Number.isFinite(value) && value > 0 && value <= 0x10ffff
        ? String.fromCodePoint(value)
        : match;
    }
    return entities[key.toLowerCase()] ?? match;
  });
}

export function extractMenuPageUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    try {
      const url = new URL(decodeHtml(match[2]), BASE_URL);
      if (url.hostname !== "www.saizeriya.co.jp") continue;
      if (!/^\/menu-popular\/\d{4}\/?$/.test(url.pathname)) continue;
      url.search = "";
      url.hash = "";
      url.pathname = url.pathname.replace(/\/?$/, "/");
      urls.add(url.toString());
    } catch { /* Skip invalid links */ }
  }
  return [...urls];
}

export function extractMenuDetail(html, pageUrl) {
  const page = new URL(pageUrl);
  if (page.hostname !== "www.saizeriya.co.jp") return null;
  const code = page.pathname.match(/^\/menu-popular\/(\d{4})\/?$/)?.[1];
  if (!code) return null;

  const rawTitle = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const name = decodeHtml(rawTitle.replace(/<[^>]+>/g, ""))
    .replace(/\s*[|｜]\s*サイゼリヤ.*$/u, "")
    .trim();
  if (!name || name === "サイゼリヤ") return null;

  const validImage = (raw) => {
    try {
      const url = new URL(decodeHtml(raw), page);
      if (url.protocol !== "https:" || url.hostname !== "www.saizeriya.co.jp") return null;
      if (!/^\/files\/[^/]+\.(?:webp|jpe?g|png)$/i.test(url.pathname)) return null;
      url.search = "";
      url.hash = "";
      return url;
    } catch { return null; }
  };

  // Official pages identify their actual main dish photo through og:image.
  // Unlike numbered ranking/combination graphics, its filename may omit the code.
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\b(?:property|name)\s*=\s*(["'])(?:og:image|twitter:image)\1/i.test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!content) continue;
    const main = validImage(content);
    if (main && !/[_-](?:rank|comb\d*|block\d*)\./i.test(main.pathname)) {
      return { code, name, pageUrl: page.toString(), imageSource: main.toString() };
    }
  }

  // Fallback when the page has no product-specific social image.
  for (const match of html.matchAll(/\b(?:src|srcset|data-src|data-srcset|data-original)\s*=\s*(["'])(.*?)\1/gi)) {
    for (const entry of decodeHtml(match[2]).split(",")) {
      const raw = entry.trim().split(/\s+/)[0];
      const image = validImage(raw);
      if (!image) continue;
      const filename = decodeURIComponent(image.pathname.split("/").pop());
      if (!filename.startsWith(`${code}_`) && !filename.startsWith(`${code}-`)) continue;
      if (/_rank\.|_comb\d*\.|_block\d*\./i.test(filename)) continue;
      return { code, name, pageUrl: page.toString(), imageSource: image.toString() };
    }
  }
  return null;
}
