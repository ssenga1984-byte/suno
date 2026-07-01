# JUON サイト デザイン品質底上げ 設計書（Quality Uplift Spec）

> 版: 2026-06-14 / 状態: 監査反映済み（§13）。Codex ランはサンドボックス制約で2度ストールしたため、同一観点を**コード実測のセルフ監査**で代替し穴を塞いだ。Codex 逐語レポートが後続で得られれば §13 に追補する。
> 上位文書: [DESIGN.md](../../DESIGN.md)（既存契約の正本）/ [JUON-ADAPTATION.md](./JUON-ADAPTATION.md)（terracotta適用層）
> 本書は **DESIGN.md の下位・補完**。矛盾時は DESIGN.md の既存契約（Banner / Motion / Imagery / Accessibility / 事実整合性 / 個人情報境界）を優先する。

---

## 0. 目的と原則

配色（`forest.*` の緑アンカー）と既存契約を維持したまま、**terracotta の規律**（セマンティックトークン / serif見出し→sans本文のタイプスケール / 単一アクセント / content-first / 余白リズム）を**コンポーネント層で実配線し直し**、以下の品質ギャップを解消する。

- 余白・リズムが窮屈
- ページ間の不揃い
- 見出し・階層が弱い
- 全体に安っぽい / 古い

**美的アンカー: 静かな editorial・余白主導**（無印良品 / 高級誌の質感）。装飾ではなく、余白・タイポ・一貫性で上品さを出す。

---

## 1. 現状の事実確認（Source of Truth の再定義）

設計・実装で最も事故りやすい点。**ライブ実体と デッドコードを取り違えない。**

| 区分 | 実体 | トークン/書体の現状 |
|---|---|---|
| **ライブUI（正本）** | `src/App.tsx`（約4860行）のインライン・コンポーネント。`main.tsx` は `App` のみ描画 | `forest.*`（586箇所）＋ `font-serif`（53箇所）を使用 |
| ページデータ正本 | `src/data/siteContent.ts`（`consultContent.ts` / `staffData.ts` / `diagnosticKeywords.ts`） | — |
| **デッドコード（触らない）** | `src/components/*`（Button/Card/Hero/Header/SectionHeading 等）と `src/pages/*`（PageRenderer/pageData） | `emerald-*` / `stone-*` / `amber-*`（Tailwind既定・41箇所）＋ sans見出し。**App.tsx は `./components` を import していない** |

> ⚠️ **`src/components/*` と `src/pages/*` を編集しても画面に出ない。** 本設計の対象は **App.tsx のインライン・コンポーネント**のみ。デッドコード削除は別タスク（起票済み）。

### ライブ・インライン・コンポーネントの所在（2026-06-14 時点・実装時に再確認）

| コンポーネント | 概算行 | 役割 |
|---|---|---|
| `PageBanner` | App.tsx:572 | Top Hero / Standard Banner |
| `TextOnlyPageBanner` | App.tsx:653 | 写真なしバナー（装飾枠付き） |
| `ActionLink` | App.tsx:679 | CTA / リンクボタン（primary/secondary/quiet） |
| `SectionHeading` | App.tsx:720 | セクション見出し（eyebrow + serif h2 + 金下線 + body） |
| Header / Card 群 / CTA Banner | App.tsx 各所（インライン） | 実装時に `grep` で特定してから編集 |

### 確認された品質負債（実測）

1. **タイプスケールが中央化されていない** — `tailwind.config.ts` に `fontSize` 定義なし。サイズが各コンポーネントにベタ書き（banner `text-3xl/4xl/6xl/7xl`、section `text-3xl/5xl`）。
2. **本文・リードが `font-bold`** — `text-base font-bold leading-8` が多用され、editorial の落ち着きが出ていない（「安っぽい」の主因の一つ）。
3. **余白がアドホック** — `py-16 md:py-20` / `py-20 md:py-28` / `mb-5` / `mt-6` / `mt-9` 等が場当たり。縦リズム不在。
4. **PageBanner にページ別ハードコード分岐**（home / activities / support のタイトル・リード）が混入し、データ正本（siteContent）と二重管理。
5. **CTA（ActionLink）の状態が不足** — default / hover / focus-visible のみ。active / disabled / loading が未定義。角丸（radius）も未指定で意図が曖昧。
6. **色トークンの肥大化** — `forest.*`(10) に加え `tint.*`(6) と `consult.*`(9)。単一アクセント規律と緊張。

---

## 2. スコープ（触る / 触らない）

### 触る範囲（In Scope）
- **共通デザインシステムの定義と実配線**：セマンティックトークン / タイプスケール / スペーシング・縦リズム。
- **App.tsx のライブ共通インライン・コンポーネント**：`PageBanner` / `TextOnlyPageBanner` / `SectionHeading` / `ActionLink` / ライブ Header / インライン Card 群 / CTA Banner。
- **抑制的 editorial 仕上げ**：影・罫線・角丸・区切り・本文ウェイトの統一。
- **画像ルール**：比率・トーン統一・トリミング・コントラスト（**新規撮影/生成はしない**）。
- **`tint.*` / `consult.*` の段階移行**：legacy として semantic 層へマッピングし、ページ別に置換。
- **全ルートへの適用チェックリスト**。

### 触らない範囲（Out of Scope）
- 緑のブランドアンカー（`forest.*`）。**clay-orange は不採用**。
- `forest.gold #B79A5B` の**色値**（使い方だけ引き締める。値変更しない）。
- バナー3種の**種別**（Top Hero / Standard / CTA）。
- **モーション契約**（DESIGN.md §Motion を維持）。
- **ダークモード**（現状未実装・対象外）。
- **事実整合性 / 個人情報境界 / 無顔ルール**（DESIGN.md を継承）。
- **実フォームの新設**（contact/consult は公式へ誘導するのみ・実送信なし）。
- **本文の事実改変**（イベント名・日付・場所・人数・費用・空き状況を創作しない）。
- **デッドコード**（`src/components/*` / `src/pages/*`）の編集（削除は別タスク）。

---

## 3. セマンティックトークン定義

terracotta の「役割ベース・単一アクセント」に合わせ、**意味で名付けたトークン層**を新設する。中身は `forest.*` に集約。生 HEX・生 Tailwind パレット（`emerald/stone/amber`）はライブコードで使わない。

### 3.1 セマンティック → 実値 対応表

| セマンティックトークン | 役割 | 実値（`forest.*`） |
|---|---|---|
| `surface/base` | 基調面（body背景） | `linen #FBFAF5` |
| `surface/sunk` | 一段沈めた面・セクション地 | `paper #F6F3EA` |
| `surface/raised` | カード等の浮き面 | `#FFFFFF`（または `linen`） |
| `surface/inverse` | 濃色面（バナー/フッター/CTA Banner） | `deep #123B2A` |
| `text/heading` | 見出し文字 | `deep #123B2A` |
| `text/body` | 本文 | `ink #1E2722` |
| `text/muted` | 補助・キャプション | `muted #7B8A80` |
| `text/inverse` | 濃色面上の文字 | `linen #FBFAF5` |
| `accent` | **単一アクセント**（CTA・小マークのみ） | `gold #B79A5B` |
| `accent/hover` | アクセントhover | `goldlight #C5AA68` |
| `line/hairline` | 罫線・区切り | `deep` @ 12〜16% |
| `focus` | フォーカスリング | `moss #A8C66C` |
| `support/leaf` | 補助グリーン（チップ地等・控えめ） | `leaf #4F7D5A` / `tint.moss #EEF7F2` |

> 実装方式（**確定 / 監査で一本化**）: `tailwind.config.ts` に `colors.ui.*`（例 `ui.surface.base`）として semantic alias を追加し、`forest.*` を参照させる。`forest.*` は内部実値として残す。
> **CSS変数方式（`:root` の `--ui-*`）は採用しない。** 現状の静的テーマ（ダークモード無し・`theme()` 参照中心）に対し alias の方が単純で、ビルド時に解決でき実行時コストも無いため。混在は禁止。

### 3.2 状態色（status）
- 状態は**色だけで伝えない**（DESIGN.md Accessibility）。アイコン/テキストを必ず併用。
- 募集状況など**事実に関わる状態は creative に色付けしない**。中立に保ち、最新は公式へ誘導。
- 必要な最小限のみ定義：`state/info = forest.leaf`。success/warning/danger は**現状新設しない**（要件が出たら terracotta 原典値 `#16A34A`/`#D97706`/`#DC2626` を semantic 経由で追加）。

### 3.3 legacy トークン移行マップ（`tint.*` / `consult.*`）

**方針: ページ固有パレットを廃し、semantic に集約。** 一括置換ではなく**ページ単位で段階移行**（§10）。移行完了後に `tailwind.config.ts` から legacy を削除。

> ⚠️ **移行ソースは App.tsx だけではない。** 現状の実測では `App.tsx` に `bg-tint-*` が3箇所、`src/data/consultContent.ts` に `bg-consult-*` / `text-consult-*` / `bg-tint-*` が13箇所ある（データに色クラスがベタ書き）。consult 移行時は **App.tsx と `consultContent.ts` の両方**を更新する。`tailwind.config.ts` から legacy 定義を削除する前に、両ファイルで class prefix 参照ゼロを grep 確認すること。

| legacy | 現用途（推定） | 移行先 semantic |
|---|---|---|
| `tint.sky` `tint.skyline` `tint.aqua` | 淡い水色の背景帯 | `surface/sunk`（または `support/leaf` の淡色）に統一 |
| `tint.lime` `tint.leaf` `tint.moss` | 淡い緑の背景帯 | `surface/sunk` / `support/leaf` |
| `consult.matcha` | consult 緑系地 | `support/leaf` 淡色 |
| `consult.teal` `consult.tealink` | consult 主役色 | `accent`（単一化）または `text/heading` |
| `consult.amber` `consult.amberink` | consult 強調 | `accent` / `accent/hover` |
| `consult.sand` `consult.sandink` | consult 地・文字 | `surface/sunk` / `text/muted` |
| `consult.rose` `consult.roseink` | consult 注意/強調 | `state/info` または `text/muted`（色での状態表現を避ける） |

> consult ページが**独自パレットでセクション識別**している場合、その識別を「色」ではなく「見出し・余白・アイコン」で代替する。完了後 consult は semantic のみで成立させる。

---

## 4. タイポグラフィ・スケール

terracotta 原典スケール **14 / 16 / 18 / 24 / 32 / 40** を採用し、Top Hero 用の大ステップを追加。**見出し=serif（Noto Serif JP）/ 本文・ナビ・フォーム=sans（Noto Sans JP）**。和文可読性のため line-height を広めに、本文は最小16px、長文に `font-bold` を使わない。

### 4.1 役割スケール（fixed steps・`tailwind.config.ts` の `fontSize` に登録）

| ロール | 用途 | size (mobile→md) | font | weight | line-height | letter-spacing |
|---|---|---|---|---|---|---|
| `display` | Top Hero h1 | 40 → 56 | serif | 500 | 1.12 | normal |
| `h1` | Standard Banner h1 | 32 → 44 | serif | 500 | 1.16 | normal |
| `h2` | セクション見出し | 28 → 40 | serif | 500 | 1.2 | normal |
| `h3` | サブ見出し | 20 → 24 | serif | 500 | 1.3 | normal |
| `lead` | バナー/導入リード | 18 | sans | **400** | 1.8 | normal |
| `body` | 本文 | 16 | sans | 400 | 1.8 | normal |
| `body-sm` | 補助本文 | 14 | sans | 400 | 1.7 | normal |
| `eyebrow` | 小見出しラベル | 12 → 14 | sans | 600 | 1.4 | 0.16em（**ラテン語のみ** uppercase/tracking。和文は通常字間・非uppercase） |
| `caption` | 注記・出典 | 12 | sans | 400 | 1.6 | normal |

### 4.2 和文ルール
- `font-bold`（700）を**本文・リードに使わない**。強調は `text/heading` 色 or weight 500 まで。
- 見出し serif の weight は **500（medium）**で統一（現状 `font-medium` 踏襲）。
- `text-wrap: balance`（既存）を見出しに維持。`overflow-wrap: anywhere` の `word-break: break-all` は**和文長語のみ**に限定し、ラテン語/URL を不自然に分断しない（support の `keep-all` 既存対応を一般化）。
- ビューポート連動の過度な拡大は禁止（DESIGN.md）。`display` の 40→56 は md ブレークの固定2段で、無段階 clamp の暴れを避ける。

---

## 5. スペーシング / 縦リズム

4の倍数スケール **4 / 8 / 12 / 16 / 24 / 32** を基準に、セクション用の大ステップ **48 / 64 / 96** を追加。`tailwind.config.ts` の `spacing` に意味付きエイリアスでも、既定 spacing の運用ルールでも可（一方式に統一）。

| トークン | 値 | 用途 |
|---|---|---|
| `space/3xs`〜`space/md` | 4 / 8 / 12 / 16 / 24 / 32 | 要素内・近接 |
| `space/section-y` | 64（mobile）→ 96（md） | セクション縦パディング（現 `py-16/20` を増やし余白を確保） |
| `space/heading-gap` | 24 | 見出し→本文 |
| `space/card-pad` | 24 | カード内パディング（現 `p-5`=20 を 24 に） |
| `space/card-gap` | 24 | カード間 |
| `space/banner-y` | Top 80→96 / Standard 56→72 | バナー縦パディング |
| `width/read` | 768（`max-w-3xl`） | 長文読み幅 |
| `width/page` | 1280（`max-w-7xl`） | ページ最大幅 |

縦リズム原則: **1セクション = 上下対称の `section-y`**、見出しブロックと本文ブロックの間は `heading-gap`、隣接セクションで余白が不揃いにならないよう全ルートで共通化。

---

## 6. コンポーネント仕様（ライブ App.tsx 対象）

### 6.1 PageBanner / TextOnlyPageBanner
- 面: `surface/inverse`、文字 `text/inverse`、eyebrow `focus(moss)`（濃色面上）。
- h1: `display`（top） / `h1`（standard）ロール。serif 500。
- lead: `lead` ロール・**weight 400**（現 `font-bold` を解除）。
- CTA: `ActionLink` を最大2つ（DESIGN.md Banner 準拠）。
- オーバーレイ: 既存2層グラデを維持しつつ、文字領域の実コントラストが WCAG AA を満たすことを確認。
- **ページ別ハードコード分岐（home/activities/support のタイトル・リード）を `siteContent.ts` の banner データへ移設**し、コンポーネントは汎用化（不揃い・二重管理の解消）。
- 高さ: Top `min-h 660→720`、Standard `min-h 420→500`（既存値維持）。

### 6.2 SectionHeading
- 構成維持: eyebrow（`accent` gold）→ serif h2（`h2` ロール・`text/heading`）→ 金下線 → body（`text/muted`・weight400）。
- 金下線を標準化: `height 2px / width 48px / accent`（装飾はこの1本のみ。アクセントを増やさない）。
- 中央寄せ既定。左寄せが必要な箇所は `align` を追加してもよいが、ページ内で揺らさない。

### 6.3 ActionLink（CTA / リンクボタン）＝ 状態マトリクス
最小タップ 44px（現 `min-h-12`=48 維持）。radius = `4px`（sm、意図を明確化）。

| variant | default | hover | active | focus-visible | disabled |
|---|---|---|---|---|---|
| `primary` | 地 `accent`・字 `text/heading`・1px `accent` 枠 | 地 `accent/hover` | わずかに沈む（translateY 0／opacity .95、跳ねない） | 2px outline `focus`・offset 4px | opacity .5・`pointer-events:none` |
| `secondary` | 透明・字/枠 `text/inverse`（濃色面）または `text/heading`（明色面） | 反転（地 `surface/base`・字 `text/heading`） | 同上沈み | 同上 | 同上 |
| `quiet` | 透明・1px `line/hairline`・字 `text/heading` | 地 `surface/sunk` | 同上 | 同上 | 同上 |

- アイコン: 外部リンクは `ExternalLink`、内部は `ArrowRight`（既存踏襲）。
- `loading` が要る箇所（現状ほぼ無し）は将来用に「ラベル維持＋スピナー＋`aria-busy`」を予約定義。今回新設はしない。

### 6.4 Card 群（インライン）
- 面 `surface/raised`、1px `line/hairline`、radius 8px、影 `elevation/1`。
- padding `card-pad`(24)、カード間 `card-gap`(24)。
- interactive 時: hover で `translateY(-3px)` ＋ `elevation/2`（既存 about/support/consult の hover を統一値へ収束）。
- eyebrow は `eyebrow` ロール・色 `accent`（散らさない範囲で）。タイトル `h3`、本文 `body-sm`/`body`・weight400。
- 診断キーワード等のチップは**クリック不可 `<span>`**（DESIGN.md）。地は `support/leaf` 淡色、枠 hairline。

### 6.5 Header（ライブ）
- 面: `surface/base` 半透明 + backdrop-blur（既存）。下辺 `line/hairline`。
- ブランド・主要ナビ・相談CTAを共通化。ナビ文字 `text/muted`→hover `text/heading`。
- CTA は `ActionLink primary`。
- モバイル: メニューボタンに開閉ラベル（`aria-expanded`）とフォーカス可視。
- フォーカスは `focus(moss)` リング。

### 6.6 CTA Banner（セクション末尾）
- 面 `surface/inverse`、控えめな `accent` CTA（DESIGN.md 準拠）。ページごとの別デザイン禁止。

### 6.7 状態の汎用ルール
- 全インタラクティブ要素に default / hover / focus-visible / active / disabled を定義。focus は `focus(moss)`、色だけで状態を伝えない。

---

## 7. 仕上げルール（抑制的 editorial）

| 項目 | ルール |
|---|---|
| 角丸 | `sm 4px`（ボタン・チップ）/ `md 8px`（カード）。**大角丸ヒーロー禁止**（DESIGN.md）。 |
| 影 | 2段のみ。`elevation/1 = 0 1px 2px rgba(18,59,42,.06)`、`elevation/2 = 0 8px 24px rgba(18,59,42,.08)`。現 `boxShadow.soft`（blur48・重い）は `elevation/2` へ置換し軽量化。 |
| 罫線 | 1px `line/hairline`。装飾の太枠を作らない。 |
| 区切り | セクション区切りは余白優先。線が要る場合は hairline、または SectionHeading の金下線1本まで。 |
| 本文ウェイト | 長文は 400。強調は色 or 500 まで。`font-bold` を本文に使わない。 |
| グラデ | ページ独自グラデ禁止（DESIGN.md）。バナーの濃緑オーバーレイのみ許可。 |

---

## 8. 画像ルール（ルールベース・新規生成なし）

- **比率の統一**: Top Hero=フルブリード（既存 min-h）。カード内画像=`3:2`（または `4:3`）に統一。ページ内で混在させない。
- **トーンの統一**: 彩度・明度のばらつく画像を並置しない。必要なら共通の弱い暖色オーバーレイで cohesion を作る（文字可読性を損なわない範囲）。
- **トリミング/無顔**: DESIGN.md 継承。support は下顔・身体・後ろ姿・手元のみ、目を写さない。
- **コントラスト**: 濃色面上の文字・口コミ画像上の文字は WCAG AA を満たす暗幕を確保。
- **事実性**: 生成画像を史実・実イベントの証拠として提示しない。`alt` は写真/参照の意味を説明。
- 「いかにもAI生成で安っぽい」画像は**差し替え候補リスト**として別タスク起票（本設計では置換作業をしない）。

---

## 9. モーション / アクセシビリティ / 事実整合性（継承確認）

- **モーション**: DESIGN.md §Motion を**変更しない**。スクロール浮上（20〜32px・約0.55s・ease-out・once）、route切替、card hover を維持。跳ね/回転/無限ループ/パララックス禁止。`prefers-reduced-motion: reduce` で全停止/最小化し本文即時表示。
- **アクセシビリティ**: 全ルート意味ある `document.title`、可視ラベル、`alt`、フォーカス可視（`focus(moss)`）、色のみで状態を伝えない、44px+ タップ、WCAG 2.2 AA。
- **事実整合性 / 個人情報境界**: イベント詳細・募集・空き状況を創作しない。contact/consult は公式へ誘導、ローカルで個人情報を保存/送信/送信に見せない。voices は要約・編集の明示、人物表象にしない。recruitment は `2026-05-12` スナップショット注記を維持。

---

## 10. 段階ロールアウト計画

各フェーズ末で `npm run build` 成功＋主要ページ Before/After（Desktop1440 / Mobile390）を確認。

| Phase | 内容 | 完了の目安 |
|---|---|---|
| **P0 基盤（additive・見た目不変）** | `tailwind.config.ts` に semantic トークン / `fontSize` ロール / `spacing`・`boxShadow` を追加。`forest.*` 実値は温存。 | build成功・既存画面に視覚差分ほぼ無し |
| **P1 共通コンポーネント実配線** | `PageBanner`/`TextOnlyPageBanner`/`SectionHeading`/`ActionLink`/ライブHeader/CTA Banner を semantic＋type role＋仕上げ＋状態マトリクスへ。本文 `font-bold` 解除。PageBanner のページ別分岐を siteContent へ移設。 | 全ルートの chrome が統一。Before/After で「不揃い・階層」改善確認 |
| **P2 ページ別監査 & legacy移行** | 全ルートをチェックリスト（§11）で監査。`bg-tint-*` / `text-tint-*` / `bg-consult-*` / `text-consult-*` を semantic へ置換。余白リズム・カード統一。 | legacy class prefix 参照ゼロ（grep）。各ページ余白リズム一致 |
| **P3 画像トーン & a11y最終** | 画像比率/トーン統一、コントラスト・focus・title・alt 最終確認。 | WCAG AA・横スクロール無し |
| **P4 デッドコード削除（別タスク連携）** | `src/components/*` / `src/pages/*` 削除。**本設計の前提（ライブはApp.tsx）を壊さないことを確認後**に実施。 | ビルド・ルーティング不変 |

> P1 が最大レバレッジ（chrome が全ルートに伝播）。P4 は依存タスクで、P0〜P3 と独立に進めてよいが削除前に参照ゼロを確認。

### 10.1 実装分割ガード（レビュー反映）

P0〜P3 は見た目の刷新ではなく、**事故を起こさない順序で品質負債を減らす作業**として扱う。以下を守らない実装計画は差し戻す。

- **P0 は additive のみ**: `tailwind.config.ts` へ `ui.*` alias / type role / spacing / elevation / layer を追加するだけ。`forest.*` / `tint.*` / `consult.*` の削除、`App.tsx` の大規模置換、文言変更はしない。
- **P1 は共通 chrome に限定**: `PageBanner` / `TextOnlyPageBanner` / `ActionLink` / `SectionHeading` / Header / CTA Banner を先に直す。ページ本文カード群、consult 本文、画像網羅対応は P2 以降に回す。
- **P2 はページ単位で進める**: `#/consult`、`#/support`、`#/events` など、1ページ単位で token 置換・余白・カード・本文 weight を閉じる。全ファイル一括置換は禁止。
- **P3 は視覚・a11y・画像の仕上げ専用**: 画像寸法、LCP/CLS、contrast、focus、alt、横スクロールを確認する。ここで新しい色体系や新しいレイアウト方針を追加しない。
- **P4 は削除タスク**: `src/components/*` / `src/pages/*` を消す場合は、P0〜P3 の完了後に参照ゼロを確認して別PR/別作業として扱う。

---

## 11. ページ別 適用チェックリスト

対象ルート（DESIGN.md Source of Truth）:
`#/`, `#/first-time`, `#/activities`, `#/events`, `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi`, `#/voices`, `#/consult`, `#/contact`, `#/about`, `#/about/story`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`, `#/support`（暫定PNG: `#/course`, `#/faq`）

### 全ルート共通チェック
- [ ] バナーが3種契約（Top Hero / Standard / CTA）のいずれかに一致。
- [ ] 色は semantic トークンのみ（生 `emerald/stone/amber` 無し、`bg-tint-*` / `text-tint-*` / `bg-consult-*` / `text-consult-*` 残存無し）。
- [ ] 見出し=serif で type role（display/h1/h2/h3）適用。本文=sans・weight400・最小16px・行間1.7+。
- [ ] セクション縦余白が `section-y`、見出し→本文が `heading-gap` で統一。
- [ ] アクセントは `accent` の CTA・小マークのみ（金を散らさない）。
- [ ] CTA/リンクが状態マトリクス（hover/active/focus-visible/disabled）準拠。
- [ ] 角丸/影/罫線が §7 準拠。
- [ ] `document.title` / `alt` / 可視ラベル / focus可視。
- [ ] Mobile390 で横スクロール無し、Desktop1440 で余白破綻無し。

### ページ固有チェック（抜粋）
- `#/`：Top Hero 直下に Story Steps → Diagnostic helper（順路と分岐補助を見出しで区別）。診断は補助導線、`#/events`/`#/first-time`/`#/consult`/`#/support` を常時表示。結果領域 `aria-live="polite"`。`#/course` を結果に出さない。
- `#/voices`：本文DOM描画、`voices.png` を本文画像にしない。要約・編集の明示、人物表象にしない。最新募集への導線。
- `#/support`：寄付/会員登録フォームに見せない。無顔フレーミング。最終手続きは公式。
- `#/consult`：実フォーム無し。`#/events`/`#/first-time`/`#/contact` への導線維持。色でのセクション識別を廃し見出し/余白で代替。
- `#/contact`：送信完了/申込完了に見せない。主CTAは公式問い合わせ導線。
- `#/about/*`：親ハブに集中させず子ページへ分割。staff はテキストのみカード（人物画像/アバター禁止）。story は公式長文の引用や生成画像の史実化をしない。
- `#/events`：募集スナップショットの注記（`2026-05-12`・変動可能性・詳細で最新確認）。
- `#/course`, `#/faq`：暫定PNG＋共通ヘッダー、主要導線へ戻る CTA を明示。

---

## 12. Definition of Done / 検証方法

### 完了条件（本設計に基づく実装フェーズ）
- [ ] P0〜P3 完了（P4はデッドコード削除タスクで別管理）。
- [ ] §11 チェックリストを全ルートで監査・合格。
- [ ] 主要ページ（最低 `#/`, `#/activities`, `#/events`, `#/consult`, `#/support`, `#/about`）の **Before/After スクショ（Desktop1440 / Mobile390）でユーザー承認**。
- [ ] `npm run build` 成功。
- [ ] 横スクロール無し（Mobile390）・余白破綻無し（Desktop1440）。

### 検証方法
1. **チェックリスト監査**（客観）：§11 を機械的に確認。
2. **トークン grep**（客観）：ライブコードに生 `emerald-/stone-/amber-` が無い、legacy class prefix（`bg-tint-` / `text-tint-` / `bg-consult-` / `text-consult-`）が残らない、`font-bold` が本文に無いことを grep で確認。
3. **Before/After 目視承認**（主観）：上記ページのスクショ比較でユーザーが上品さ・一貫性・階層を承認。
4. **a11y チェック**：`document.title`/`alt`/focus/コントラスト/reduced-motion。

### 12.1 実装者用の客観ゲート（レビュー反映）

実装完了時は、主観的な「よくなった」だけで合格にしない。最低限、以下の実測を報告する。

| 観点 | 合格条件 | 確認方法 |
|---|---|---|
| build | `npm run build` 成功 | コマンド結果 |
| ルート | §11 の全DOM正本ルートが表示可能 | Browser/Playwright で hash route を巡回 |
| 横スクロール | Mobile390 で `document.documentElement.scrollWidth <= window.innerWidth` | desktop/mobile 両方 |
| legacy token | ライブ対象に `bg-tint-` / `text-tint-` / `bg-consult-` / `text-consult-` が残らない | `App.tsx` / `consultContent.ts` / `tailwind.config.ts` を grep |
| Tailwind既定色 | ライブ対象に `emerald-` / `stone-` / `amber-` が残らない | dead code は別集計として除外 |
| font weight | 段落・リードの `font-bold` が 0。短いUIラベルは `font-semibold` へ降格済み | `font-bold` の残存を用途別に棚卸し |
| 画像 | 全 `<img>` が寸法または固定比率を持つ。LCP候補は eager/high、フォールド外は lazy | `<img>` 21箇所を個別確認 |
| scroll offset | `scrollIntoView` 5箇所が sticky header 高さを考慮 | `scroll-padding-top` と実ヘッダー高を照合 |
| z-index | 新規 z 値が §13 の layer 表に含まれる | `z-` 12箇所を棚卸し |
| a11y | focus 可視、色だけで状態を伝えない、濃色/画像上文字が AA | 主要ページの目視 + 必要に応じて測定 |

注: `src/components/*` / `src/pages/*` は本計画では dead code として扱うため、grep 結果に含める場合は「除外対象」として別欄に分ける。

### 本設計書（ドキュメント）自体の完了条件
- [x] 設計書本体（§0–§12）作成。
- [x] ページ別チェックリスト（§11）と段階ロールアウト（§10）を含む。
- [x] **徹底レビューで穴を塞ぐ** → §13 に反映（Blocker2 / Major5 / Minor5 ＋ Top5）。Codex ランはサンドボックス制約で2度ストールしたため、同一観点を**コード実測のセルフ監査**で代替。Codex 逐語が後で得られれば追補。
- [x] `DESIGN.md` から本書への参照リンクを追加。

---

## 13. 監査で塞いだ穴（追加規定）

§0–§12 に対するコード実測監査（`App.tsx` / `tailwind.config.ts` / `index.css` / `siteContent.ts` / `consultContent.ts` を grep・実読で確認）で判明した抜け・矛盾・検証不能点と、その確定対応。重大度は Blocker / Major / Minor。**ここでの規定は本文同節の上書き・補強として有効。**

### Blocker（実装前に必ず塞ぐ）

- **B-1 ホームバナーのタイトルがデータとコードで乖離（実バグ）**
  根拠: `siteContent.ts:359` の `/` の `banner.title="この週末、森に出かけよう。"` に対し、`App.tsx`（PageBanner 内）は home/activities/support で**別のタイトル・リードをハードコード**して上書き。データ側タイトルは**描画されない死にデータ**。
  対応: §6.1 のページ別分岐撤去を Blocker 扱いにする。ハードコード文言を `siteContent.ts` の `banner.title/lead` に**一本化**し、PageBanner は data のみ描画。移設時に文言の正本（改行位置含む）をユーザー確認（事実改変防止）。

- **B-2 トークン実装方式の未決を解消済み**
  対応: §3.1 で **alias 方式に確定**（CSS変数方式は不採用）。実装前の方式論争を排除。

### Major

- **M-1 画像の CLS/LCP/遅延読み込みが未規定**
  根拠: `App.tsx` の全 `<img>`（ロゴ 369、バナー 611/2052、カード 1784/1962、地図 1854 ほか）に `width`/`height`/`loading`/`decoding`/`fetchpriority` が**無い**。§8 は比率・トーンのみ。
  対応（§8 に追加）:
  - すべての `<img>` に**固有の寸法**を与える（`width`/`height` 属性、または親に `aspect-ratio` ボックス）。CLS を出さない。
  - **ファーストビューのバナー画像（LCP候補）**: `loading` を付けない（eager）＋ `fetchpriority="high"` ＋ `decoding="async"`。ロゴも eager。
  - **フォールド外の画像**（カード・地図・口コミ等）: `loading="lazy"` ＋ `decoding="async"`。
  - 背景兼用の `object-cover` 画像はコンテナ比率を固定して可変高さの跳ねを防ぐ。

- **M-2 `font-bold` の規模と線引きが粗い**
  根拠: `App.tsx` に `font-bold` が **188箇所**。本文/リードと、eyebrow・カテゴリ（例 1966 `text-sm font-bold text-forest-gold`）・fact ラベル等の**小ラベルが混在**。§4 の「本文に font-bold 禁止」だけでは判定不能。
  対応（§4.2 を上書き）:
  - **除去対象（→ weight 400）**: `lead` / `body` / `body-sm` ロールの段落・リード（長文）。
  - **降格対象（→ weight 600 = `font-semibold` 相当の `eyebrow`/label トークン）**: eyebrow、カテゴリ、fact ラベル、ナビ、CTA ラベル等の短い UI ラベル。**700 は使わない。**
  - これは P2 の主要工数（〜188箇所）。grep ガードは「`font-bold` を**段落/リード要素**に対して検出したら不合格」に限定し、ラベル系の `font-semibold` 化は別カウントで追跡。

- **M-3 z-index / レイヤリング層が未定義**
  根拠: `App.tsx` に z 指定 12箇所（header `z-50`、バナー媒体 `-z-20`/`-z-10`、画像上バッジ `top-0 ... bg-forest-deep/88` 等）。設計書に層の定義が無く、場当たり値が増える。
  対応（§7 に層トークン追加）: `layer/base=0`、`layer/banner-media=-10〜-20`（コンテンツ背面）、`layer/overlay-badge=10`、`layer/sticky-header=50`、`layer/mobile-menu=60`。新規 z 値はこの表からのみ採る。

- **M-4 sticky header オフセットと scroll-padding の不整合**
  根拠: header は `App.tsx:362` で `sticky top-0 z-50` ＋ `min-h-16`(64px)。一方 `index.css` は `scroll-padding-top: 5rem`(80px)。アンカー遷移時の着地位置がヘッダー実高とズレる。
  対応（§5/§6.5 に追加）: ヘッダー高さの**単一の正**を定義（`--header-h` 相当）し、`scroll-padding-top` = ヘッダー高 + 小余白で算出。`ActionLink` の内部アンカースクロール（`scrollIntoView`）も同オフセットを尊重。値を 64/80 のどちらかに恣意的に決めず、実ヘッダー高に追従させる。

- **M-5 consult パレットの移行ソース漏れ**（§3.3 に反映済み）
  根拠: `consultContent.ts` に `bg-consult-*` / `text-consult-*` / `bg-tint-*` 形式の色クラスが存在する。`consult.*` のようなドット表記では検出できないため、grep パターンを誤ると legacy 削除の直前で参照漏れを見落とす。
  対応: §3.3 の ⚠️ 注記に加え、検証パターンは `bg-consult-` / `text-consult-` / `bg-tint-` / `text-tint-` とする。`tailwind.config.ts` の `consult:` / `tint:` 定義削除前に、ライブ対象ファイルで上記 class prefix が 0 であることを確認する。

- **M-6 `consultContent.ts` は文言と色クラスが同居しており、色置換時に本文を壊しやすい**
  根拠: consult の tone/accent はデータファイル内にあるため、デザイン token 置換と本文データ編集の境界が曖昧になりやすい。既存本文に文字化け・エンコーディング問題が見える場合でも、デザイン uplift の一括置換で復旧しようとすると差分が肥大化する。
  対応: 本計画で `consultContent.ts` を触る場合は **tone/accent の class 置換だけ**に限定し、title/body/questions 等の文言は変更しない。文字化け復旧や文言修正は別タスクとして、公式導線・表示確認・ユーザー確認を伴って扱う。

### Minor

- **m-1 本文中リンクの可視性が未規定**
  根拠: `index.css:35-38` が `a { text-decoration: none }`。本文中リンクが色のみで判別され「色だけで状態を伝えない」(§9) に抵触し得る。
  対応: 本文（prose）内リンクは `accent`/`text/heading` 色 ＋ **hover/focus で下線**を出し、視覚的に識別可能にする。ナビ・CTA・カードリンクは対象外（別スタイル）。

- **m-2 コントラストの合否値が抽象**
  対応（§9 に追加）: 本文テキスト ≥ 4.5:1、大テキスト(≥24px or 19px太) ≥ 3:1、UI 境界/フォーカス ≥ 3:1。**濃緑面・画像上の文字は文字帯の実測値**で判定（オーバーレイ濃度で担保）。

- **m-3 404 / 空状態のチェック欠落**
  根拠: ルータに `default:`（`App.tsx:301`）あり。§11 に未記載。
  対応（§11 共通チェックに追加）: `default`（未知パス）は共通ヘッダー＋「見つからない」明示＋主要導線への戻り CTA を描画。診断結果の 0 件・募集スナップショットの空も崩れないこと。

- **m-4 行長（measure）未規定**
  対応（§5 に追加）: 長文本文は読み幅 `width/read`(768) を上限にし、和文で概ね 30〜45 字/行に収める。広い面で行が伸びすぎないよう prose 幅を制限。

- **m-5 Web フォントの FOUT/読み込み戦略が未規定**
  対応（§4 に追加）: Noto Serif JP / Noto Sans JP は `font-display: swap`、主要ウェイト（見出し serif 500 / 本文 sans 400・600）を preload、フォールバックは既存の Yu Mincho / Yu Gothic 系でメトリクス近似。和文ウェブフォントは重いので**サブセット/必要ウェイトのみ**。切替時のレイアウトシフトを最小化。

### 実装前に必ず塞ぐべき Top5
1. **B-1** ホームバナータイトルの data/コード乖離を解消（ハードコード→`siteContent` 一本化、文言はユーザー確認）。
2. **M-1** 全 `<img>` に寸法＋`loading`/`decoding`/`fetchpriority` を付与（CLS/LCP）。
3. **M-2** `font-bold` 188箇所の線引き（本文=400 / ラベル=600、700全廃）と grep ガード。
4. **M-4 + M-3** sticky header 高さの単一正と `scroll-padding` 整合、z-index 層トークン化。
5. **M-5(§3.3)** consult 移行で `consultContent.ts` も更新し、legacy 削除前に両ファイル参照ゼロを確認。

### 実装前の保留判定

現時点の readiness は **Conditional Go**。P0 は開始可能だが、P1 以降は次の条件を満たしてから進める。

- ホームバナーの最終文言を `siteContent.ts` に一本化する前に、表示する `title` / `lead` / 改行位置をユーザー確認する。
- `font-bold` 188箇所は一括置換せず、段落・リード・UIラベル・見出しに分類してから処理する。
- 画像21箇所は LCP候補 / ロゴ / フォールド外 / 装飾寄り に分類し、属性付与の方針を先に決める。
- `scrollIntoView` 5箇所は単なる `scroll-padding-top` 変更だけでなく、実ヘッダー高とフォーカス移動後の見え方を確認する。
- `consultContent.ts` の文言修正は本計画から分離する。デザイン token 置換のついでに本文を修正しない。

---

## 付録A. 実装メモ（事故防止）
- 編集前に `grep -n 'case "/' src/App.tsx` でライブ関数を特定。`src/components/*`・`src/pages/*` は触らない。
- トークン追加は **Tailwind alias 方式**に統一する。CSS変数方式との混在は禁止。
- ページ別ハードコードは siteContent へ寄せ、コンポーネントを汎用に保つ。
- 1フェーズ＝1観察可能単位。フェーズ末で build＋Before/After を残す。
