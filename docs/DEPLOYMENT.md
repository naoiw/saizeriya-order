# GitHub Pages デプロイ構成

## 公開先

| 環境 | ブランチ | URL / Vite base |
| --- | --- | --- |
| 本番 | `main` | https://naoiw.github.io/saizeriya-order/ ・ `/saizeriya-order/` |
| 開発プレビュー | `develop` | https://naoiw.github.io/saizeriya-order/develop/ ・ `/saizeriya-order/develop/` |

**GitHub Pagesは1つのサイトです。** 本番とプレビューを別々のPagesデプロイにせず、両方のビルド結果を同じartifactへまとめます。Pages設定：**Settings → Pages → Build and deployment → Source: GitHub Actions**。

## 共通ワークフロー

- `.github/workflows/ci.yml`：`naoiw/.github/.github/workflows/reusable-node-ci.yml` を呼び出します。
- `.github/workflows/deploy-pages.yml`：`naoiw/.github/.github/workflows/reusable-vite-pages.yml` を呼び出します（`publish-preview: true`）。
- 参照元は[naoiw/.github](https://github.com/naoiw/.github)の**リリース済みv1.1.0**（SHA `00047e65d7e53551e2644df02d2f22743ea2c471`）に固定しています。`@main`のような移動する参照先は使用しません。
- 実行環境：**Node.js 26 / pnpm 9.14.2**。依存のインストールは`pnpm install --frozen-lockfile`です。
- CIは`pnpm lint`（ESLint）、`pnpm typecheck`、`pnpm test`（全テスト・データセット検証）、`pnpm build`を実行します。

## 実行条件

1. `main`と`develop`へのpush、または両ブランチを対象とするPRでCIを実行。
2. `main`へのpushでは本番とプレビューをまとめてデプロイ。
3. `develop`への**push CIが成功した場合のみ**、`workflow_run`でPagesをデプロイ。
4. `workflow_run`では同じリポジトリ・`develop`ブランチ・pushイベント・成功結果を照合します。PR由来の結果ではデプロイしません。
5. 必要に応じ`main`から`workflow_dispatch`で手動公開できます。

`workflow_run`はデフォルトブランチ**`main`に呼び出し側YAMLが存在して初めて有効**です。`develop`へ変更をマージしても、`main`側が旧workflowの間は旧workflowが実行されます。**共有Pages workflowの本番利用はmainリリース後**です。

## 成果物の構成

共通Pagesは`main`のソースを`stable/`、CIで検証した`develop`のソースを`preview/`へcheckoutします。

- 本番：`pnpm run build --base=/saizeriya-order/` → `site/`直下へ
- プレビュー：`pnpm run build --base=/saizeriya-order/develop/` → `site/develop/`へ
- `site/.nojekyll`を追加してGitHub Pagesへ公開
- buildジョブは`contents: read`のみ。deployジョブは`pages: write`、`id-token: write`を必要とします。

既存の`pnpm build:pages:main` / `build:pages:develop`もローカル検証用に維持しています。

## ローカルの確認

```bash
npm install --global pnpm@9.14.2
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build:pages:main
pnpm build:pages:develop
```

両方のビルドは同じ`dist/`を使い、後から実行した方が残ります。

## セキュリティ・運用上の留意点

- GitHubのRuleset、Pagesの設定、Dependabot alerts/Dependency graphはリポジトリのSettingsで管理します。テンプレートから自動継承されません。
- workflowの共通SHAを更新する際は[共有ワークフローリリース](https://github.com/naoiw/.github/releases)とCI/Pages検証を確認し、別PRで変更します。
- `dry-run: true`を使うと公開せずartifact生成を確認できます（別の検証用workflowで実行してください）。`dry-run`でも呼び出し元の権限宣言は必要です。
- 公式商品の画像はブラウザから外部取得します。画像URLなしの商品は「画像なし」で表示し、ビルドには影響しません。
- `develop`から`main`へのリリースは、ユーザーが明示的に承認した後に別PRを作成し、CI・デプロイ・公開URLを確認します。

## トラブルシュート

| 症状 | 確認すること |
| --- | --- |
| HTMLは表示するがJS/CSSが404 | Viteの`--base`と公開URL |
| CIで失敗 | Node.js 26、pnpm 9.14.2、Lint・型チェック・テスト・ビルド |
| `develop/`だけ古い | develop pushのCI成功、workflow_run、main上の呼び出し側workflow |
| Pagesが失敗 | Pages Source設定、artifact、`github-pages`環境の権限 |
| メニュー写真がない | 商品画像URLの有無と公式サイトの外部参照制限。URL未登録は仕様どおり「画像なし」 |
| ガチャをF5すると空になる | 仕様どおり。モードだけ保持して、次のボタン押下で再抽選 |
