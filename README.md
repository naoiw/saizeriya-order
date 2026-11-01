# SAIZERIYA ORDER

サイゼリヤの料理写真と商品名から4桁の注文番号を当てる、非公式の個人・友人向けクイズアプリです。

## 使い方

Node.js 20.19+ または22.12+ とpnpmを使用します。

```powershell
git switch develop
git pull origin develop
pnpm install
pnpm dev
```

表示されるURL（通常 `http://localhost:5173`）を開き、**クイズをはじめる**を選択すると、登録済みメニューからランダムに10問出題されます。

- 料理写真・商品名を見て4桁の注文番号を入力します。正解の番号は回答するまで表示されません。
- 画面のキーパッドに加え、数字キー・Backspace・Enterでも操作可能です。
- 各問の回答後に正解を表示し、全10問終了時に正答率と回答一覧を表示します。
- 公式画像が読み込めなかった場合は、スキップできます。
- 10件未満のデータセットではゲームを開始できません。

## データセット

商品情報は `src/data/menu.json` に集約し、`code`（4桁の文字列）、`name`、`imageSource`、`pageUrl` を管理しています。画像は公式サイトから直接読み込み、ダウンロードした画像をGitHubへ保存する必要はありません。

```powershell
pnpm check:dataset
pnpm collect:menu --dry-run
pnpm collect:menu
pnpm test:quiz
pnpm build
```

収集スクリプトは公式の[人気メニュー一覧](https://www.saizeriya.co.jp/menu-popular/)からメタデータだけを取得します。画像URLはアクセス制限やサイト更新によって利用できなくなる場合があります。

- [Issue #1：10問クイズ](https://github.com/naoiw/saizeriya-order/issues/1)
- [Issue #2：ギャラリー（今後実装）](https://github.com/naoiw/saizeriya-order/issues/2)

## 利用上の注意

本プロジェクトはサイゼリヤ非公式の個人向けアプリです。公式画像等の権利はそれぞれの権利者に帰属します。URLを直接参照する構成でも、利用許可を意味するものではありません。掲載コンテンツの利用条件を確認してください。

[MIT License](LICENSE) は本リポジトリの自作コードに適用し、公式画像には適用されません。
