# 活動UIモック再現 実装計画書

作成日: 2026-05-13

## 目的

事前に生成したUIモック画像を基準に、JUON NETWORKの活動導線をReact + Tailwind CSSで再構築する。対象は「活動一覧」から4つの活動別ページへ遷移する体験で、日本語サイトとして自然で、NPOらしい信頼感と自然体験の温度感を両立させる。

対象ルート:

- `#/activities`
- `#/forest-school`
- `#/field-school`
- `#/regional`
- `#/waribashi`

## 参照モック

主参照画像:

- `C:\Users\sench\.codex\generated_images\019e20c7-94be-7832-8024-fea1e5479cd0\ig_03c7a83cc79b8aac016a0451309ad48191b2d69a9fafa0dbb0.png`

プロジェクト内で使う生成写真:

- `public/assets/photos/generated/activity-forest-school.png`
- `public/assets/photos/generated/activity-field-school.png`
- `public/assets/photos/generated/activity-regional-block.png`
- `public/assets/photos/generated/activity-waribashi.png`

## 再現方針

- 既存サイトシェルは維持しつつ、活動一覧と活動詳細の第一印象をモックに寄せる。
- ヒーローは白いヘッダー直下に大きく配置し、濃緑の情報面と写真面を組み合わせる。
- 活動一覧は4枚カード構成にし、写真、色帯、短い説明、詳細リンクを持たせる。
- 活動詳細には「なぜ必要か」「何をするか」「参加前に知ること」の3カラムを置く。
- アイコンは`lucide-react`のSVGを使う。SVGは透過済みのため、画像アイコンの透過処理は不要。
- 生成写真には必ず日本語の`alt`を設定する。
- アニメーションは控えめにし、フェード、上方向移動、カードの軽い浮き上がり、CTA矢印の移動に限定する。
- `prefers-reduced-motion`利用者で読みにくくならないよう、CSS側でも過剰な動きを避ける。

## カラーパレット

- Forest Deep: `#123B2A`
- Forest Leaf: `#4F7D5A`
- Forest Moss: `#A8C66C`
- Paper: `#F6F3EA`
- Linen: `#FBFAF5`
- Ink: `#1E2722`
- Muted: `#6F7E74`
- Gold: `#B79A5B`
- 森林の楽校 Accent: `#2F6B4F`
- 田畑の楽校 Accent: `#8A6A32`
- 地域ブロック Accent: `#3E6F7F`
- 樹恩割り箸 Accent: `#9A7A43`

## 編集対象

- `src/types.ts`
- `src/data/siteContent.ts`
- `src/App.tsx`
- `src/index.css`
- `docs/activity-ui-mock-implementation-plan-20260513.md`
- `public/assets/photos/generated/`

既存の未コミット変更や無関係な未追跡ファイルは戻さない。

## TODO

- [ ] T1: 4活動の詳細データ、アクセント色、生成写真パスを型付きで追加する。
- [ ] T2: 活動一覧カードと活動詳細ヒーローを、参照モックに近いレイアウトへ実装する。
- [ ] T3: 3カラム情報ブロック、CTA、レスポンシブ、控えめなアニメーションを実装する。
- [ ] T4: `npm run build`を通し、型エラーとビルドエラーを解消する。
- [ ] T5: Browser Useでデスクトップとモバイルを確認し、重なり、横スクロール、画像欠落、リンク欠落を修正する。

## worker分担

### Worker A: データと型

担当:

- `src/types.ts`
- `src/data/siteContent.ts`

作業:

- 生成写真4点を`imagePaths`に追加する。
- `SiteRoute`に活動UI用の任意データを追加する。
- 4活動に、アクセント色、アイコンキー、概要、3カラム用の箇条書きを設定する。
- 日本語本文は短く、画面内で読み切れる長さにする。

受け入れ基準:

- 4活動すべてに活動UI用データが揃っている。
- 画像パスは`public/assets/photos/generated/`配下を参照している。
- TypeScriptの型とデータが整合している。

### Worker B: React/Tailwind UI

担当:

- `src/App.tsx`
- `src/index.css`

作業:

- `ActivityEntrySection`を写真付き4カード構成へ作り替える。
- `ActivityDetailPage`を写真ヒーロー、本文導線、3カラム情報ブロック中心の構成へ作り替える。
- `lucide-react`アイコンをSVGとして使用する。
- `framer-motion`またはCSSで控えめなアニメーションを付与する。
- モバイル幅でも横スクロールと文字はみ出しが出ないようにする。

受け入れ基準:

- デスクトップの第一画面が参照モックの構図に近い。
- 4活動カードが同じ視覚ルールで並ぶ。
- ヘッダー、カード、CTA、写真が重ならない。
- `alt`、`aria-label`、リンクラベルが不足しない。

### Worker C: 検証

担当:

- 原則として本番ファイルは変更しない。問題が明確な場合のみ報告する。

作業:

- `npm run build`を実行する。
- Browser Useで以下を確認する。
  - `http://127.0.0.1:5173/#/activities`
  - `http://127.0.0.1:5173/#/forest-school`
  - `http://127.0.0.1:5173/#/field-school`
  - `http://127.0.0.1:5173/#/regional`
  - `http://127.0.0.1:5173/#/waribashi`
- デスクトップ`1440x900`とモバイル`390x844`で見る。
- 画像欠落、横スクロール、テキスト重なり、CTA欠落、`document.title`、主要画像`alt`を確認する。

受け入れ基準:

- ビルドが通る。
- Browser Useで主要ルートが表示できる。
- 問題があれば、該当ルートと修正対象が分かる粒度で報告する。

## 完了条件

- `npm run build`が成功している。
- Browser Useで活動一覧と4詳細ページの表示を確認している。
- デスクトップとモバイルで横スクロールや読めない重なりがない。
- 生成写真が意図した場所に表示されている。
- 参照モックとの差分が残る場合は、最終報告で明記する。
