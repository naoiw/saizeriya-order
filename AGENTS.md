# Contributor / Agent Notes

- `main` is the stable branch, `develop` is the integration branch. Implement changes on a feature branch and open a PR targeting `develop`. Do not merge into `main` without a release decision.
- Current scope: dataset bootstrap. Game mode and gallery are tracked by Issues #1 and #2; implement them separately.
- Never commit downloaded official product images. `public/images/` is intentionally ignored. Keep the app usable without bundling third-party images in a public repository.
- Menu order numbers are four-character strings, not integers.
- Dataset metadata lives in `src/data/menu.json`. Each record needs `code`, `name`, `image`, `imageSource`, `pageUrl`.
- Collector must remain polite: sequential fetch, no auth bypass, no crawling unrelated sites. Only associate a product with an image after verifying its filename code. Do not guess failed matches.
- Run `npm run test:collector` and `npm run build` before merging; the GitHub CI workflow performs both.
- Do not quietly rewrite or delete existing menu entries when the source website is unavailable. Log failures for human review.
