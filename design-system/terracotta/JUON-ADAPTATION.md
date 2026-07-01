# Terracotta × JUON 適用ガイド

> 出典: [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) の `terracotta` スキル。
> 原典の `SKILL.md` / `DESIGN.md` はこのフォルダにそのまま保管している（上流の正本）。
> 本ファイルは、その設計思想を JUON サイトの既存トークンへ翻訳した**プロジェクト適用層**であり、原典と矛盾する場合は本ファイルを優先する。

## なぜ terracotta を選んだか

JUON サイトの方向性（落ち着いた森・信頼できる NPO・初参加者に近づきやすい入口・写真主体・長文の安心情報）に対し、terracotta の核となる原則がそのまま重なる:

| terracotta の原則 | JUON の既存ルール（[DESIGN.md](../../DESIGN.md)） |
|---|---|
| warm cream surfaces（温かいクリーム面） | `forest.paper` / `forest.linen` を基調面に使う |
| ink-toned headlines in a **display serif**（serif 見出し） | 「見出しは日本語 serif（Noto Serif JP）」 |
| **a single accent**（アクセントは1色に限定） | 「`forest.gold` は CTA と小さなアクセントに限定」 |
| earthy, human, **content-first** / long-form reading | 「信頼できる NPO」「初参加でも迷わない導線」、about/story・first-time 等の長文安心情報 |
| 装飾より読みやすさと視覚リズム | 「装飾性よりも実際に参加する感覚を優先」 |

clean / spacious は配色が青基調（#3B82F6）の汎用テック寄りで温かみと serif が無く不適合、cafe は温かいが見出し serif を持たない。terracotta だけが「warm surface + serif 見出し + 単一アクセント + content-first」を同時に満たす。

## トークン対応表（原典 → JUON 実トークン）

terracotta の clay-orange パレットは**そのまま採用しない**。JUON のブランドアンカーは森の緑（`forest.*`）。terracotta からは「面・見出し・アクセントの使い分けの規律」だけを取り込む。

| terracotta token | 役割 | JUON で使う実値（`tailwind.config.ts`） |
|---|---|---|
| `surface #FFFFFF` | 基調面 | `forest.linen #FBFAF5` / `forest.paper #F6F3EA` |
| `secondary #F3E9D8`（cream） | 副面・カード地 | `forest.paper #F6F3EA` |
| `text #111827` | 本文・見出し文字 | `forest.ink #1E2722` / 見出し `forest.deep #123B2A` |
| `primary #C56A3C`（単一アクセント） | CTA・強調の1色 | `forest.gold #B79A5B`（CTA・小アクセント限定） |
| display = DM Serif Display | 見出し書体 | `font-serif`（Noto Serif JP / Yu Mincho） |
| body = sans | 本文・ナビ・フォーム | `font-sans`（Noto Sans JP 系） |
| success/warning/danger | 状態色 | JUON 既存の意味色があれば優先、無ければ原典値を流用 |

> 補足: terracotta 原典は body にも serif を当てるが、JUON は「本文・ナビ・フォームは sans-serif」を維持する。**serif は見出しのみ**。

## 採用する規律（terracotta から取り込むもの）

- **セマンティックトークン優先** — 生の HEX ではなく `forest.*` トークンを使う。
- **視覚階層の保持** — serif 見出し → sans 本文の対比でリズムを作る。
- **アクセントは1色** — `forest.gold` を増やさない。CTA と小アクセント以外に金を散らさない。
- **インタラクション状態を明示** — default / hover / focus-visible / active / disabled / loading / error を定義（focus は `forest.moss` 系、既存ルール踏襲）。
- **WCAG 2.2 AA / 44px+ タップ領域 / reduced-motion 対応** — JUON の Accessibility 節と一致。低コントラスト・余白リズムの乱れ・曖昧ラベルを禁止。
- **content-first** — 長文ページ（about/story, first-time, consult）は読みやすさと視覚リズムを最優先。

## 採用しないもの（JUON ルールが優先）

- terracotta の clay-orange 配色（`#C56A3C` 等）→ 不採用。緑のブランドアンカーを崩さない。
- "playful" トーン → JUON は「落ち着いた・信頼できる」を優先。過度な遊びは入れない。
- 本文 serif → JUON は本文 sans を維持。
- バナー・モーション・写真ルールは JUON `DESIGN.md` の既存契約（Banner System / Motion / Imagery）が常に優先。
