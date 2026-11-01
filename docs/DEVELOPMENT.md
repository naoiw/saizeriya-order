# 開発・テスト手順

## 動作環境

- Node.js 20.19+ または 22.12+（CIは22）
- pnpm 9系（Pagesワークフローは9.14.2）
- React 19 / TypeScript 5 / Vite 7
- 単体テストはNode.js組み込み `node --test` を使用

## セットアップ

```bash
git clone https://github.com/naoiw/saizeriya-order.git
cd saizeriya-order
git switch develop
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

表示されたURL（通常 `http://localhost:5173`）からアクセスしてください。`pnpm dev` はローカル開発サーバーを起動します。

## テストとビルド

```bash
pnpm test:collector  # 公式HTMLの解析・画像抽出
pnpm test:quiz       # 重複なしの出題・4桁入力・採点
pnpm test:gacha      # 重複あり抽選・再抽選・入力検証
pnpm test:gallery    # グループ化・検索・並び替え
pnpm test:dataset    # 実データの番号・バリエーション整合性
pnpm check:dataset   # JSONの形式、URL、グループの静的検証
pnpm build           # TypeScriptの型チェック + Viteビルド
```

`pnpm build` の生成物は `dist/` に出力されます。Pages用のbaseパスもローカルで検証できます。

```bash
pnpm build:pages:main
pnpm build:pages:develop
```

これらは異なるbaseパスで同じ `dist/` に出力するため、両方を連続実行した場合は**後に実行したビルドが残ります**。APIキー・サービスアカウントは不要です。

## コード構成

| パス | 役割 |
| --- | --- |
| `src/App.tsx` | 表示モード、URLハッシュの同期、ヘッダー／フッター |
| `src/components/Quiz.tsx` | 5問クイズの状態管理と入力UI |
| `src/components/Gacha.tsx` | ボタン起点の抽選と直前の番号保存 |
| `src/components/Gallery.tsx` | 商品一覧・検索・並び替え・表示切替 |
| `src/components/DishImage.tsx` | 公式写真の表示と読み込み失敗時の代替UI |
| `src/lib/quiz.mjs` / `gacha.mjs` / `gallery.mjs` | テスト可能な抽選・採点・ギャラリー処理 |
| `src/lib/menu.ts` | メニューデータの型と起動時検証 |
| `src/data/menu.json` | 4桁注文番号をキーとするメニュー情報 |
| `src/styles.css` | 共通レイアウト、各モード、レスポンシブCSS |
| `scripts/` | メニュー収集、静的検証、テスト |
| `.github/workflows/` | PR／push時のCI、Pagesデプロイ |

`src/lib/*.d.mts` はJavaScriptで実装したロジックの型定義です。対応する`.mjs`を変更したら型との整合も確認してください。

## メニュー情報の更新

メニューの追加・修正は [data-management.md](data-management.md) の手順に従ってください。

```bash
pnpm collect:menu --dry-run
pnpm collect:menu --limit 5 --dry-run
# 差分と出典を確認した後に限り書き込み
pnpm collect:menu
pnpm check:dataset
pnpm test:dataset
```

- 収集スクリプトは公式ページを逐次取得する**ネットワーク処理**です。頻繁な繰り返しは避けてください。
- 既存の手動レビュー済みレコードは収集時に上書きせず、コードにない新規メニューを追加するために使います。
- 新しい複数番号グループを設定する場合は `src/lib/menu.ts` と `scripts/check-dataset.mjs` にある公式ページの例外対応も確認してください。
- 画像URLが実際に正しい料理を示すかは静的テストだけでは保証できません。プレビューで目視確認が必要です。

## PRとブランチ運用

1. `develop` を起点に作業ブランチを作り、コードや文書を編集します。
2. PRのCIが成功したら `develop` にマージし、開発プレビューで動作を確認します。
3. 本番反映が必要な場合に `develop` → `main` のPRを作り、確認後にマージします。
4. マージ済み一時ブランチは削除し、`main` と `develop` を残します。

**画面の変更**ではブラウザで、クイズ5問の操作、ガチャ未抽選→抽選→再抽選、F5時の未抽選化、ギャラリー検索、スマートフォンでのスクロール・横ズレを確認してください。CIの単体テストはDOMや実機レイアウトを網羅しません。

開発用UIの寸法・表示ルールは [ui-guidelines.md](ui-guidelines.md) を参照してください。

