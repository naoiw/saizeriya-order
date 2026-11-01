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
