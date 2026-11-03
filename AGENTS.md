# Contributor / Agent Notes

- `main` is the stable branch. Implement work on a feature branch and open a PR to `develop`.
- Game mode and gallery are tracked in Issues #1 and #2; keep their full implementation separate from dataset infrastructure.
- Official menu images are **not** tracked as files. Render their `imageSource` URLs directly in the browser; provide a fallback when an image fails to load.
- The `src/data/menu.json` file is the canonical list, with `code`, `name`, `imageSource`, `pageUrl` per item.
- Four-digit `code` is a string. Preserve leading zeros, verify uniqueness, and never guess a code/image association.
- The collector only fetches HTML metadata; it must never download or commit third-party image binaries. Use sequential requests and don't bypass server restrictions.
- Keep all existing menu entries unless a verified manual cleanup is intentional. Never overwrite the user's collected dataset with a four-item example.
- Validate changes with `npm run test:collector`, `npm run check:dataset`, and `npm run build`. CI runs these checks.
- Document that third-party image URLs can change or be blocked and that use of official images remains subject to rights and site terms.

- Pages deployment is defined on default branch `main` and mirrored on `develop`. `main` pushes and successful `develop` push CI runs trigger a single deployment containing production at `/saizeriya-order/` and preview at `/saizeriya-order/develop/`. Both builds must use their respective Vite base paths. A release to `main` requires a PR and explicit user approval.

- Item records are question-level, keyed by four-digit code. `groupId` + `variantLabel` combine serving-time and wine-color variants into a single gallery card without merging quiz answers.
- For existing verified records, the collector MUST preserve `imageSource`, `groupId`, `variantLabel`, and `enabled`. Prefer official main photo (`og:image`) instead of rank/combination images.
- Do not enable drink-bar code 5101 until a suitable official photo has been approved. It stays in the JSON but is hidden from quiz and gallery.
- Check `pnpm test:dataset` (grouping and photo overrides) in addition to existing checks. Keep Issue #11 open for pending photo reviews.

- The quiz is five questions per round. The Gacha mode is five draws **with replacement** from enabled order codes (not grouped gallery cards), so duplicates and distinct variants are intentional.
- Gacha uses browser crypto randomness (not a fixed clock seed), and stores the immediately preceding ordered draw in tab-scoped sessionStorage to avoid an identical reroll/reload. Keep the algorithm testable by accepting an injected random callback.
- Compact mobile styling applies only to `.quiz-play`. Do not set `overflow: hidden` on body or alter shared chrome tokens; ensure small screens remain scrollable if content genuinely exceeds the viewport.

- The menu dataset includes 114 records: 35 existing + 70 February 2026 references + 8 official breakfast numbers + 1 seasonal soup. Keep the source notes and tests in sync with changes.
- `imageSource` is optional; never invent image URLs. A missing image must be shown as exactly **画像なし** and remain quiz-playable. Only real image load errors can show a skip action.
- `verification: "reference"` means a historical menu code not yet verified as currently available. `menuScope: "morning"` / `"seasonal"` distinguish limited menus. The order-oriented Gacha excludes these until reviewed.
