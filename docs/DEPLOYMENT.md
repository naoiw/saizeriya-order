# GitHub Pages デプロイ構成

## 公開URL

| 環境 | ブランチ | URL / base |
| --- | --- | --- |
| 本番 | `main` | https://naoiw.github.io/saizeriya-order/ ・ `/saizeriya-order/` |
| 開発プレビュー | `develop` | https://naoiw.github.io/saizeriya-order/develop/ ・ `/saizeriya-order/develop/` |

GitHubリポジトリの **Settings → Pages → Build and deployment → Source** は `GitHub Actions` を使用します。専用のPages環境は1つで、同じ成果物に本番とプレビューを含めます。

## CI

`.github/workflows/ci.yml` は `main`／`develop` のpushとPull Requestで実行されます。

- 依存関係をインストール（CIはNode.js 22、`npm install --no-audit --no-fund`）
- `test:collector`、`test:quiz`、`test:gacha`、`test:gallery`、`test:dataset`
- `check:dataset`（注文番号とURLなどの形式検証）
- `build`、`build:pages:main`、`build:pages:develop`

失敗したPRの内容はマージしません。単体テストの成功だけでは外部画像の表示やスマホの見た目までは保証できません。

## Pagesワークフロー

`.github/workflows/deploy-pages.yml` は**デフォルトブランチ `main`** に置き、以下のイベントで実行します。

1. `main` へのpush（本番リリース）
2. `develop` の**push**を対象としたCIワークフローが成功したとき（`workflow_run`）
3. `main` からの手動実行（`workflow_dispatch`）

`develop` のCI失敗時やPRイベントからは、開発プレビューを公開しません。

### ビルドと成果物

- 本番: `main` を `production/` にcheckoutし、`pnpm build:pages:main` で `production/dist/` を生成。
- プレビュー: `develop` のCIで検証されたコミット（`workflow_run.head_sha`）または `develop` を `preview/` にcheckoutし、`pnpm build:pages:develop` で `preview/dist/` を生成。
- Pages artifact: `production/dist/` の中身をルートへ、`preview/dist/` の中身を `develop/` へコピー。`.nojekyll` も含めます。
- `actions/deploy-pages@v4` で `github-pages` 環境に公開します。

Pages側のビルド前検証では `test:collector`、`test:quiz`、`test:gallery`、`check:dataset` を実行しています。**`test:gacha` と `test:dataset` はCI側の検証項目**であり、Pagesワークフロー内では個別には実行していません。

ビルド用 Node.js は22、pnpmは9.14.2。依存関係は `pnpm install --frozen-lockfile` を使用します。

## 手動での確認

ローカルでbaseパスを検証する場合は次のコマンドを使います。

```bash
pnpm install --frozen-lockfile
pnpm build:pages:main
pnpm build:pages:develop
```

続けて実行した場合、`dist/` は最後のコマンドの成果物になります。公開結果は [GitHub Actions](https://github.com/naoiw/saizeriya-order/actions) から確認できます。

## トラブルシュート

| 症状 | 確認すること |
| --- | --- |
| ページは開くがJS／CSSが404 | `vite` のbaseパスが本番／プレビューと一致しているか |
| `develop/` だけ古い | `develop` のpush CI成功と、それを起点にした `Deploy GitHub Pages` の実行・成功 |
| CIは成功だが公開されない | `github-pages` 環境／PagesのSource設定と`deploy`ジョブ結果 |
| メニュー写真だけ表示されない | `www.saizeriya.co.jp` の画像URL、ブラウザのネットワーク状態、サイト側の外部参照制限 |
| ガチャ結果がF5で消える | 仕様どおり。モードだけ維持され、再度ボタンを押すと抽選します |

公開サイトには公式サイトへの画像リクエストが発生します。画像をGitHub Pagesへ複製しているわけではありません。

