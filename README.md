# SAIZERIYA ORDER

サイゼリヤの料理写真と商品名から4桁の注文番号を当てる、非公式の個人・友人向けクイズアプリです。

現段階では **商品データと公式写真URLの収集・確認機能** までを実装しています。ゲームモードとギャラリーは別Issueで管理します。

## セットアップ

Node.js 20.19+ または 22.12+ と pnpm を使用します。

```powershell
git switch develop
git pull origin develop
pnpm install
pnpm check:dataset
pnpm dev
```

表示されるURL（通常 `http://localhost:5173`）を開くと、登録商品と公式画像のプレビューを確認できます。

## データセット

- `src/data/menu.json`: 商品番号・商品名・公式画像URL・出典ページ
- `imageSource`: ブラウザで `<img src>` にそのまま渡す公式URL
- `code`: 4桁の**文字列**。先頭ゼロも保持できるよう数値には変換しない

公式画像はゲーム実行時にサイゼリヤのサーバーから読み込みます。**画像のダウンロード・Gitへのコミットは不要です。**
以前のスクリプトで作成された `public/images/` 内の画像は使用しません。 `.gitignore` により引き続きGit管理対象外です。

公式の[人気メニュー一覧](https://www.saizeriya.co.jp/menu-popular/)から商品を追加・更新する場合は次のコマンドを使用します。

```powershell
pnpm collect:menu --dry-run
pnpm collect:menu
pnpm check:dataset
```

`pnpm collect:menu --limit 5` で一部だけを確認することもできます。現在の収集処理は画像を保存せず、JSONのメタデータだけを更新します。

構造チェックでは注文番号の重複、欠損、公式URL形式、画像ファイル名との対応を確認します。**公式画像へのアクセス可否・料理写真との一致はブラウザで目視確認してください。**

## 開発予定

- [#1 10問ランダムクイズ](https://github.com/naoiw/saizeriya-order/issues/1)
- [#2 カード／リスト表示のギャラリー](https://github.com/naoiw/saizeriya-order/issues/2)

## 利用上の注意

これはサイゼリヤ非公式の個人向けプロジェクトで、株式会社サイゼリヤによる承認や提携を示すものではありません。公式画像等の権利は各権利者に帰属します。

画像URLの参照は画像ファイルを再配布しない構成ですが、外部サイトからの直接表示が許容されるかは別問題です。サイト側で参照制限やURLの変更があると画像が表示されなくなる可能性があります。第三者に公開する前に利用条件を確認してください。

このリポジトリの[MIT License](LICENSE)は、自作コードに適用されるものであり、公式画像には適用されません。
