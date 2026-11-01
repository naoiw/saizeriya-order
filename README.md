# SAIZERIYA ORDER

サイゼリヤの料理写真と商品名から4桁の注文番号を当てる、非公式の個人・友人向けクイズアプリです。

## 起動方法

Node.js 20.19+ または22.12+ とpnpmを使用します。

```powershell
git switch develop
git pull origin develop
pnpm install
pnpm dev
```

表示されるURL（通常 `http://localhost:5173`）を開きます。画面上部のメニューから「クイズ」と「ギャラリー」を切り替えられます。

## GitHub Pages

| 環境 | URL | 公開条件 |
| --- | --- | --- |
| 本番（main） | [正式版を開く](https://naoiw.github.io/saizeriya-order/) | `main` へのPush |
| 開発（develop） | [開発版を開く](https://naoiw.github.io/saizeriya-order/develop/) | `develop` へのPush後、CI成功 |

Pagesは **GitHub Actions** をソースとして、１つの成果物のルートに本番、`develop/` に開発版を格納します。`main` 側のPages Workflowは、`main` へのPush時と `develop` のCI成功時に両環境をビルドし直します。`develop` の検証に失敗した場合はデプロイしません。

ローカルでPages用のパスを検証する場合：

```powershell
pnpm build:pages:main
pnpm build:pages:develop
```

デプロイ結果は [GitHub Actions](https://github.com/naoiw/saizeriya-order/actions) で確認できます。

## クイズ

- 登録済みメニューから**重複なしでランダムに10問**出題
- 料理の写真と商品名を見て4桁の注文番号を回答
- 画面の数字キーパッド、キーボードの数字キー・Backspace・Enterに対応
- 各問の回答後に正解を表示。全問終了後は正答率・回答一覧を表示
- 画像を読み込めなかった場合はスキップ可能
- データセットが10件未満の場合は開始できない

## ギャラリー

- 登録商品の画像・名前・4桁注文番号を一覧表示
- カード表示／リスト表示の切替（スマホにも対応）
- 商品名・注文番号で検索（全角数字での検索も可能）
- 注文番号・商品名の昇順／降順で並び替え
- 画像読み込み失敗時の代替表示と、公式商品ページへのリンク

## 商品データ

商品情報は `src/data/menu.json` に集約し、`code`（4桁文字列）、`name`、`imageSource`、`pageUrl` を管理しています。画像は公式サイトから直接読み込み、ダウンロード画像をGitHubへ保存しません。

```powershell
pnpm check:dataset
pnpm collect:menu --dry-run
pnpm collect:menu
pnpm test:collector
pnpm test:quiz
pnpm test:gallery
pnpm build
```

`collect:menu` は公式の[人気メニュー一覧](https://www.saizeriya.co.jp/menu-popular/)からメタデータだけを取得します。画像URLのアクセス制限や商品ページ変更によって表示できなくなる場合があります。画像を目視で確認し、収集結果は商品番号と照合してください。

関連Issue：[クイズ #1](https://github.com/naoiw/saizeriya-order/issues/1) / [ギャラリー #2](https://github.com/naoiw/saizeriya-order/issues/2)

## 利用上の注意

本プロジェクトは株式会社サイゼリヤとは無関係の非公式アプリです。公式画像等の権利はそれぞれの権利者に帰属します。画像URLの直接参照であっても利用許可を意味するわけではないため、サイトの利用条件に従ってください。

[MIT License](LICENSE) は本リポジトリの自作コードに適用し、公式画像には適用されません。
