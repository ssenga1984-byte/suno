# CMS管理画面 UX改善計画

作成日: 2026-06-29
対象: Decap CMS（`public/admin/`）
方針: Decap CMS設定の最適化（独自UIは構築しない）
スコープ: ローカル開発環境での検証まで（本番OAuth/デプロイは別計画）

## 背景と目的

非エンジニアの事務局スタッフがイベント募集情報を更新する際、現在の管理画面は「文字だらけで一目でやりたいことがわかりにくい」状態。特に新規イベント作成時にステップバイステップのサポートがほしいという要望がある。

## 前提と制約

- **CMSバックエンド**: `config.yml` の `repo: satoshi19840417/suno` は開発用。本番運用前に正式なリポジトリ・Netlify OAuth設定を別計画で確定すること
- **`local_backend: true`**: 本計画のスコープはローカル検証まで。本番デプロイ前にこのフラグの扱いを決める（削除 or 環境変数分岐）
- **デプロイ**: Netlify（静的ビルド）。CMSで保存 → GitHubにcommit → Netlify再ビルドのフロー

## 改善対象

- **重点改善**: イベント募集コレクション
- **軽微改善**: サイト設定・固定ページ（hint追加のみ）

## 改善項目

### 0. イベントJSONの動的読み込み化（Blocker修正）

現在の `contentLoader.ts` は10件のイベントJSONを固定importしており、CMSで新規イベントを追加しても公開サイトに反映されない。

**変更方針**: Viteの `import.meta.glob` を使い、`content/events/*.json` を動的に読み込む。

```typescript
const eventModules = import.meta.glob<EventJson>(
  "../../content/events/*.json",
  { eager: true, import: "default" }
);
const allEvents = Object.values(eventModules);
```

**影響ファイル**:
- `src/data/contentLoader.ts` — 固定import 10行 → glob 2行に置換
- `tsconfig.app.json` — `"types": ["vite/client"]` は設定済み（`import.meta.glob` の型解決に必要）

**注意**: `import.meta.glob` のパスは `src/` 外のファイルを指すが、Viteはビルド時にこれを静的解析するため動作する（devサーバー・ビルドの両方で検証すること）。

### 1. フィールド整理（イベント募集）

| 変更 | 内容 |
|---|---|
| 月ラベル自動生成 | CMS上の `monthLabel` フィールドを廃止。`contentLoader.ts` で `startDate` から `YYYY年M月` を自動生成 |
| カテゴリ整理 | 後述（1a参照） |
| ステータス備考を非表示化 | デフォルト値で固定、`hint` で「通常は変更不要」と明記 |
| 写真の出典・安全メモを折りたたみ | `collapsed: true` で初期非表示。「わからなければ空欄でOK」のhint |
| 写真altにデフォルト値 | `default: "活動の様子"` を設定 |
| 写真ラベルにデフォルト値固定 | `default: "過去活動の様子"` + hint追加 |

**結果**: 運用者が実際に触るフィールド数 13 → 8

#### 1a. `category` フィールドの扱い

現状の `category` の値は2種類ある：
- テーマ系: 「森林の楽校」「田畑の楽校」（`theme` と同じ値）
- 地域ブロック系: 「関東甲信越地域ブロック」（`theme` とは異なる意味）

`App.tsx` では `item.theme === selectedTheme || item.category === selectedTheme` のようにフォールバックとして使われている。

**方針**: `category` を `theme` と同じ select にするのではなく、以下の選択肢で独立したselectにする：
- `options: ["森林の楽校", "田畑の楽校", "地域交流", "里山体験", "農作業体験", "関東甲信越地域ブロック"]`
- hint: 「イベントの分類。テーマと異なる場合のみ変更」
- 既存JSONデータはそのまま維持（移行不要）

#### 1b. `monthLabel` 削除の影響範囲

`monthLabel` は以下の箇所で参照されている。すべて `contentLoader.ts` 内の自動生成値を使うよう修正する：

| ファイル | 箇所 | 修正内容 |
|---|---|---|
| `src/data/contentLoader.ts` | EventJson型、loadEvents() | `startDate` から `monthLabel` を生成して返す |
| `src/types.ts:103` | RecruitmentItem型 | `monthLabel: string` は維持（生成値が入る） |
| `src/App.tsx:2042` | 森林の楽校セクション | 変更不要（`item.monthLabel` をそのまま使える） |
| `src/App.tsx:2673` | イベント月フィルタ | 変更不要 |
| `src/App.tsx:4293-4298` | 月別グルーピング | 変更不要 |
| `src/App.tsx:4469-4471` | 月別グループ見出し表示 | 変更不要 |
| `content/events/*.json` | 10ファイル | `monthLabel` フィールドを削除 |

**ポイント**: 型定義 `RecruitmentItem.monthLabel` は維持し、`contentLoader.ts` の `loadEvents()` 内で `startDate` → `monthLabel` を生成して付与する。App.tsx側の変更は不要。

### 2. カスタムプレビュー（イベントカード風）

`public/admin/index.html` に `CMS.registerPreviewTemplate` でイベントカードプレビューを追加。

**実装方針**:
- Decap CMSの `window.CMS` グローバルオブジェクトを使用
- `CMS.registerPreviewTemplate("events", EventPreview)` で登録
- プレビューコンポーネントは `createClass` でReactコンポーネントとして定義（Decap CMSのバンドル済みReactを利用）
- インラインCSSでスタイリング（公開サイトのTailwindは読み込まない）

表示内容:
- サムネイル画像（未設定時はプレースホルダー表示）
- タイトル
- 日程・場所
- テーマバッジ
- ステータス表示（draft時は「下書き」ラベルを赤で表示）

編集画面の右側にリアルタイムで表示。公開サイトのカードと完全一致は不要、「だいたいこう見える」レベル。

### 3. 一覧の視認性向上

| 機能 | 設定 |
|---|---|
| サムネイル表示 | `thumbnail` フィールドで一覧にイベント写真を表示 |
| summary充実 | `{{title}} - {{date}} | {{theme}} | {{location}} | {{status}}` |
| ソート | `sortable_fields: ["startDate", "title"]` |
| フィルタ | `view_filters` で「公開中」「下書き」ボタン |
| グループ分け | `view_groups` で月別表示 |

グリッドビュー切替（Decap CMS標準機能）で写真サムネイルのカード一覧表示も可能。

### 4. デフォルト値＋hint充実

新規作成時にサンプル値が入った状態で開く。事務局の推奨操作フローは「過去の似たイベントをDuplicate（複製）→ 日程・場所を書き換え」。

主要フィールドのhint:

| フィールド | hint |
|---|---|
| タイトル | 「活動名 + 補足。例: 北信りんごの里 田畑の楽校」 |
| 表示日程 | 「公開サイトに表示される日程文。例: 7月4日(土)〜5日(日) 桃袋かけ」 |
| 場所 | 「都道府県＋市区町村。例: 長野県飯綱町」 |
| カテゴリ | 「イベントの分類。テーマと異なる場合のみ変更」 |
| 募集詳細URL | 「CANPANブログの該当記事URLを貼り付け」 |
| ステータス | 「下書き＝公開サイトに表示されない」 |
| 画像 | 「推奨: 横800px以上、JPGまたはPNG」 |
| altテキスト | 「写真の内容を一文で。例: 参加者が森林で間伐作業をしている様子」 |

### 5. サイト設定・固定ページ（軽微改善）

- 各URLフィールドにhint追加（「どのページのURLか」の説明）
- 固定ページのバナーフィールドにhint追加（「公開サイトのどこに表示されるか」）

## 技術的な変更箇所

| ファイル | 変更内容 |
|---|---|
| `src/data/contentLoader.ts` | `import.meta.glob` で動的読み込み化 + `monthLabel` 自動生成 |
| `public/admin/config.yml` | フィールド整理、hint、default、view_filters、view_groups、sortable_fields、summary、thumbnail |
| `public/admin/index.html` | `CMS.registerPreviewTemplate` でカスタムプレビュー追加 |
| `content/events/*.json` | `monthLabel` フィールド削除（10ファイル） |

## 対象外（今回は実施しない）

- 独自管理UI構築
- ウィザード形式の入力フロー
- イベント名のインクリメンタル検索
- **本番Netlify OAuth設定**（別計画。repo名・認証方式・`local_backend` フラグの扱いを決める）
- **本番デプロイ・CI/CD設定**（別計画）

## 検証チェックリスト

実装完了の判定条件：

- [ ] `npm run build` が成功する（`tsc -b` + `vite build`）
- [ ] `npm run cms` でローカルCMSバックエンドが起動する
- [ ] `/admin/index.html` でCMS管理画面が表示される
- [ ] イベント一覧にサムネイル・テーマ・ステータスが表示される
- [ ] 公開中/下書きフィルタが動作する
- [ ] 既存イベントのDuplicate（複製）ができる
- [ ] 新規イベントをCMSから作成し、JSONファイルが `content/events/` に保存される
- [ ] CMSで追加した新規イベントが**公開サイトのイベント一覧に自動反映される**
- [ ] イベント編集画面でカスタムプレビュー（カード風）が表示される
- [ ] ステータスを「draft」にしたイベントが公開サイトに表示されない
- [ ] 画像アップロードが `public/assets/cms/` に保存される
- [ ] `npm run check:security:static` が通る
- [ ] 既存の10イベントが `monthLabel` 削除後も正しい月ラベルで表示される

## 運用ガイド（事務局向け）

### イベント追加の推奨手順

1. 管理画面 `/admin/` にアクセス
2. 左メニューから「イベント募集」を選択
3. 既存の似たイベントを開き、右上メニューから **Duplicate（複製）** を選択
4. 日程・場所・タイトル・URLなどを書き換え
5. プレビュー（右側）で見た目を確認
6. ステータスを「published」にして保存

### イベント非公開化

1. 対象イベントを開く
2. ステータスを「draft」に変更して保存
3. 公開サイトから非表示になる（データは残る）
