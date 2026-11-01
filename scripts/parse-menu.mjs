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

  for (const match of html.matchAll(/\b(?:src|srcset|data-src|data-srcset|data-original|content)\s*=\s*(["'])(.*?)\1/gi)) {
    // srcset may have several URL/density pairs.
    for (const entry of decodeHtml(match[2]).split(",")) {
      const raw = entry.trim().split(/\s+/)[0];
      if (!raw) continue;
      try {
        const url = new URL(raw, page);
        if (url.protocol !== "https:" || url.hostname !== "www.saizeriya.co.jp") continue;
        if (!/^\/files\/[^/]+\.(?:webp|jpe?g|png)(?:$)/i.test(url.pathname)) continue;
        const filename = decodeURIComponent(url.pathname.split("/").pop());
        if (!filename.startsWith(`${code}_`) && !filename.startsWith(`${code}-`)) continue;
        url.search = "";
        url.hash = "";
        return { code, name, pageUrl: page.toString(), imageSource: url.toString() };
      } catch { /* Skip broken candidates */ }
    }
  }
  return null;
}
