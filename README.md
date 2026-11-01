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

表示されるURL（通常 `http://localhost:5173`）を開きます。画面上部のメニューから「クイズ」「ガチャ」「ギャラリー」を切り替えられます。

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

## デザイン

ヘッダーとフッターは `naoiw.github.io` などのPagesアプリと同じ幅・余白・文字サイズに揃えています。共通のレイアウト値は `src/styles.css` の `--chrome-*` 変数で管理し、GitHubリンクはフッター右端に配置します。ライトモードとサイゼリヤを意識した緑のボタンは維持します。

## クイズ

- 有効な注文番号から**重複なしでランダムに5問**出題（提供タイミング・ワインの赤白は別々の問題）
- 料理の写真と商品名を見て4桁の注文番号を回答
- 画面の数字キーパッド、キーボードの数字キー・Backspace・Enterに対応
- 小さいスマホではクイズ中の画像・キー・余白を縮小し、なるべくスクロールせず回答可能にします。画面が非常に小さい場合や画像読み込みエラー時は通常のスクロールを許容します。
- 各問の回答後に正解を表示。全問終了後は正答率・回答一覧を表示
- 画像を読み込めなかった場合はスキップ可能
- データセットが5件未満の場合は開始できない

## ガチャ

- クイズとギャラリーの間の「ガチャ」で、**有効な34注文番号から5枠を重複ありで抽選**します。選んだ商品・注文番号・提供タイミングや赤白の指定を表示するため、お店で注文する遊びにも使えます。
- ガチャ画面を開いたときに自動抽選し、「もう一度ガチャを回す」ボタンで何度でも引き直せます。表示モードはURLのハッシュ（`#quiz` / `#gacha` / `#gallery`）に記録するため、**ガチャ画面でF5を押してもガチャ画面のまま新しい結果を抽選**します。
- ブラウザの `crypto.getRandomValues` で毎回新しい乱数を使い、同一タブの `sessionStorage` に直前の結果を保存して**直前と全5枠の並びが完全一致する結果を避けます**。保存ができない場合も抽選自体は利用できます。
- クイズと同じく、適切な画像が確定していないドリンクバー（5101）は抽選対象外です。

## ギャラリー

- 登録商品の画像・名前・4桁注文番号を一覧表示。ティラミス・プリン・グラスワインは1枚のカードに2番号を併記
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
pnpm test:gacha
pnpm build
```

`collect:menu` は公式の[人気メニュー一覧](https://www.saizeriya.co.jp/menu-popular/)からメタデータだけを取得します。画像URLのアクセス制限や商品ページ変更によって表示できなくなる場合があります。画像を目視で確認し、収集結果は商品番号と照合してください。

関連Issue：[クイズ #1](https://github.com/naoiw/saizeriya-order/issues/1) / [ギャラリー #2](https://github.com/naoiw/saizeriya-order/issues/2)

## メニューデータの運用

- **35件の注文番号**を登録しています（有効34件、ギャラリー31カード）。クイズは商品ごとではなく**注文番号ごと**に出題します。
- ティラミス（3201 / 3901）・イタリアンプリン（3206 / 3906）は「すぐに」「あとで」、グラスワイン（3401 / 3402）は「赤」「白」を問題に表示します。
- アロスティチーニ（1402）とパルマ風スパゲッティ（2304）の画像は公式の商品メイン写真に修正済みです。
- セットドリンクバー（5101）は適切な画像が未確定のため、`enabled: false` で一時的にクイズ・ギャラリーから除外しています。データは残しています。
- `pnpm collect:menu` は既存の手作業で修正した画像・提供タイミング等の属性を上書きせず、新しいメニューの発見に使います。商品情報の照合は[Issue #11](https://github.com/naoiw/saizeriya-order/issues/11)で管理します。

## 利用上の注意

本プロジェクトは株式会社サイゼリヤとは無関係の非公式アプリです。公式画像等の権利はそれぞれの権利者に帰属します。画像URLの直接参照であっても利用許可を意味するわけではないため、サイトの利用条件に従ってください。

[MIT License](LICENSE) は本リポジトリの自作コードに適用し、公式画像には適用されません。
