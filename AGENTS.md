<!-- naoiw:managed:start -->
# naoiw 共通AI開発規約（管理領域）

**特別な指示がない場合は naoiw/.github の開発規約を既定値として適用する。**
優先順位は (1)今回のユーザー指示 (2)このリポジトリ固有のREADME/docs/設定/既存実装 (3)naoiw/.githubの標準。すべて確認できない場合は推測せず未確認と報告する。

共通規約原本:
- https://github.com/naoiw/.github/blob/main/standards/AI_DEVELOPMENT.md
- https://github.com/naoiw/.github/blob/main/standards/GITHUB_FLOW.md
- https://github.com/naoiw/.github/blob/main/standards/TECH_STACK.md
- https://github.com/naoiw/.github/blob/main/standards/UI_STYLE.md
- https://github.com/naoiw/.github/blob/main/standards/REPOSITORY_STRUCTURE.md

## 守ること
1. 着手前に関連Issue・PR・ブランチ、README/docs、既存実装を調べ、重複作業を避ける。
2. mainは本番。原則短命ブランチ→PR→関連テスト/ビルド→ユーザーが認めたマージ。developは既に存在し用途が明示された場合だけ使用する。
3. 「Issueのみ」「実装しない」「mainにマージしない」「developだけ」などの範囲指定を優先する。
4. 依存・ライセンス・CSS・構成は個別プロジェクトの既存方針を勝手に変更しない。
5. アプリUIに開発状況・次のTODO・GitHubリンク等を依頼なく追加しない。
6. 未実施の検証を成功と報告しない。差分、PR、残課題、公開状態を明示する。
7. 参考ファイルや機密情報をPRへ混入させず、mainの差分を確認する。
8. **新規Reactアプリはpnpmを標準**とする（現行雛形は9.14.2、`pnpm-lock.yaml`）。既存アプリのnpm/pnpm/yarnは変更しない。

これは同期される指示の抜粋。詳細は上記の原本を参照する。外部リンクを取得できないAIは、取得済みと主張せずこの抜粋と対象リポジトリの規約を優先する。
<!-- naoiw:managed:end -->

## リポジトリ固有の指示

- `main` は本番、`develop` はGitHub Pagesプレビュー（`/saizeriya-order/develop/`）。短命作業ブランチから`develop`へPR、`main`へのリリースはユーザーの明示的なマージ許可後に別PRで行う。
- React / TypeScript / Vite、Node.js 26、pnpm 9.14.2。共通CI・Pages Workflowは`naoiw/.github`の検証済み40桁コミットSHAに固定。テスト・Lint・型チェック・ビルドはGitHub Actionsで確認する。
- `src/data/menu.json` は4桁の文字列`code`単位の真のデータ。公式画像が未確認なら`imageSource`を省略し、クイズ・ガチャ・ギャラリーでは「画像なし」と表示する。画像のURLを推測・捏造しない。
- 既存114番号のうち、クイズ・ガチャの出題は**通常メニュー105番号**（`enabled !== false`、`menuScope: "regular"`または未指定）。朝サイゼ8・季節限定1を除外し、将来の`store`（店舗限定）も除外する。出題選別は共通の`getPlayableMenuItems`で行う。画像なしや`verification: "reference"`は出題から除外しない。
- ギャラリーには通常・朝・季節・店舗限定を含む、すべての有効商品を掲載する。画像がなくても一覧・クイズ・ガチャの基本操作は可能とする。
- 番号・販売状況の更新では公式メニューブックと資料を比較する。2026年2月の参考資料由来の70番号については現在の注文可能性を保証しない。朝サイゼは時間・一部店舗、季節・店舗商品は提供条件を記載する。
- `groupId` / `variantLabel`はギャラリーで同じ料理の複数注文番号をまとめるために使用し、クイズ・ガチャでは番号別の問題／抽選を保つ。
- 写真ファイルをローカルへダウンロード・Git管理しない。データ収集処理は公式HTMLのみに低頻度アクセスし、既存の手動検証データを上書きしない。
- 変更時に`pnpm test`、`pnpm lint`、`pnpm typecheck`、`pnpm build`とPagesの公開パスを確認する。特にガチャの画像なし表示と、朝・季節・店舗限定の除外を回帰テストで確認する。
