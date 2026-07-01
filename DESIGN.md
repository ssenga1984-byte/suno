# JUON Site Design Guidelines

## Design System Skill: Terracotta（採用スキル）

このサイトの採用デザインシステムスキルは **terracotta**（出典: [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills)）。
フロント実装・UI 変更の前に、本 `DESIGN.md` と合わせて以下を参照すること（Codex / Claude Code 共通）。

- 適用ガイド（正本）: [design-system/terracotta/JUON-ADAPTATION.md](design-system/terracotta/JUON-ADAPTATION.md)
- 上流スキル原典: [design-system/terracotta/SKILL.md](design-system/terracotta/SKILL.md) / [design-system/terracotta/DESIGN.md](design-system/terracotta/DESIGN.md)
- 品質底上げ設計書（実装計画の正本）: [design-system/terracotta/QUALITY-UPLIFT-SPEC.md](design-system/terracotta/QUALITY-UPLIFT-SPEC.md) — セマンティックトークン・タイプスケール・スペーシング・コンポーネント状態・段階ロールアウト・ページ別チェックリストを定義。フロント改修時はまず本書を参照（対象は **App.tsx のライブ・インライン実体**。`src/components/*`・`src/pages/*` はデッドコードで触らない）。

要点: terracotta の「warm cream surfaces ＋ serif 見出し ＋ 単一アクセント ＋ content-first」という規律のみを取り込み、配色は JUON の `forest.*` をブランドアンカーとして維持する。terracotta の clay-orange 配色は採用しない。詳細・トークン対応は適用ガイドに従い、矛盾時は本 `DESIGN.md` の既存契約（Banner / Motion / Imagery / Accessibility）を優先する。

## 2026-05-13 Activity Site Split Update

- `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi` are now DOM activity-detail routes.
- `#/activities` is the hub route and must provide visible links to all four activity-detail routes.
- `#/waribashi` uses `public/assets/photos/waribashi-forest-table.png` as the route banner image and links to the official JUON detail page for final confirmation.
- The previous mockup PNGs for these activity routes remain reference assets only, not the active rendering source.

## Purpose

JUON NETWORKの活動に初めて触れる若者、学生、社会人が、里山・森林・農作業・地域交流への参加判断をしやすくするためのWebサイト。

装飾性よりも「自然の中で実際に参加する感覚」「信頼できるNPOらしさ」「初参加でも迷わない導線」を優先する。実DOM正本ルートを参加導線の中心とし、旧PNGモックは参照・暫定下層表示用に扱う。

## Source of Truth

- 実DOM正本: `#/`, `#/first-time`, `#/activities`, `#/events`, `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi`, `#/voices`, `#/consult`, `#/contact`, `#/about`, `#/about/story`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`, `#/support`
- 暫定PNG表示: `#/course`, `#/faq`
- ページデータ正本: `src/data/siteContent.ts`
- 旧モック参照: `public/assets/mockups/*.png`
- 実写素材: `public/assets/photos/*-no-face.png`

実DOM正本ページではPNG内テキストや透明ホットスポットに依存しない。見出し、本文、CTA、フォームラベル、alt、aria-label、document.titleはDOMで管理する。

## Visual Direction

- Mood: 落ち着いた森、信頼できるNPO、初参加でも近づきやすい入口。
- Palette: `forest.deep`, `forest.leaf`, `forest.paper`, `forest.linen` を主軸にし、`forest.gold` はCTAと小さなアクセントに限定する。
- Typography: 見出しは日本語serif、本文・ナビ・フォームはsans-serif。文字間は通常、ビューポート連動の過度な拡大は禁止。
- Imagery: 写真は森、田畑、里山の道、作業の手触りを伝える。抽象装飾や生成感の強い背景だけでページを成立させない。

## Banner System

バナーは3種類だけを使う。

| 種類 | 用途 | ルール |
|---|---|---|
| Top Hero | `#/` | 大きな写真、濃緑オーバーレイ、主要CTA2つまで。ブランドと参加価値を最初の画面で伝える。 |
| Standard Banner | `#/first-time`, `#/activities`, `#/events`, `#/voices`, `#/contact` と主要下層 | 高さ、余白、見出しサイズ、CTA位置、写真暗幕を共通化する。 |
| CTA Banner | セクション末尾 | 濃緑背景 + 控えめな金CTA。ページごとの別デザインは禁止。 |

禁止事項:
- ページごとの独自グラデーション。
- 抽象装飾のみのバナー。
- 角丸の大きなカード型ヒーロー。
- CTA色・形・配置のばらつき。
- 写真上の文字が読めない暗幕不足。

## Layout

- Headerは全ルート共通。主要導線へ戻れるナビゲーションを常に提供する。
- 実DOM正本ページは1セクション1目的を守る。
- カードは活動、募集、FAQ、問い合わせ窓口など、個別項目を比較する場合だけ使う。
- モバイルは1カラムを基本にし、横スクロールを出さない。
- 暫定表示ルートは暫定であることを明示し、主要導線へ戻れるCTAを置く。

## Components

### Home story and diagnostic helper

- `#/` は Top Hero の直下に、参加までの流れを示す Story Steps を置く。Story Steps は「関心を持つ → 不安を減らす → 活動を選ぶ → 日程を見る」の順路を示すトップ専用セクションとする。
- Diagnostic helper section は Story Steps の次に置く通常セクションであり、Top Hero / Standard Banner / CTA Banner の4種目にはしない。
- Story Steps は順路、Diagnostic helper section は迷った人の分岐補助として扱い、両者が同じ主導線に見えないよう見出しと導入文で役割を分ける。
- 初期表示は6カードまで。モバイルは1カラム、Desktopは3列x2行を基本にする。
- カード選択後だけ最大2問を展開し、結果は2〜3件の既存DOM正本またはDOM化済み活動ページへ送る。
- 質問文は能力を問わず、希望・制約・安心材料を聞く。「体力に自信がありますか？」ではなく「どのくらい体を動かしたいですか？」のように書く。
- `#/course` は暫定ページのため、診断結果には出さない。
- 診断は補助導線であり、通常導線として `#/events`, `#/first-time`, `#/consult`, `#/support` を常時見せる。
- 結果領域は `aria-live="polite"`、選択状態は `aria-pressed` 等で伝え、カード選択後と結果表示後にフォーカスを移す。

### Diagnostic keywords

- 診断キーワードは `src/data/diagnosticKeywords.ts` を正本にし、診断UIと活動カテゴリ表示で同じ語彙を使う。
- キーワードは活動カテゴリの案内語であり、イベント個別の受け入れ条件、初心者歓迎、学生歓迎、企業参加可、作業強度を断定するラベルではない。
- 活動カードと活動詳細ページのチップはクリック不可の `<span>` として表示し、フィルターや検索機能に見せない。

### Voices page

- `#/voices` は実DOM正本ページとして扱い、本文では `public/assets/mockups/voices.png` を表示しない。
- 参加者の声は、実際に参加した方の声の一部を、個人が特定されないよう要約・編集したものとして明示する。
- 画像は活動の雰囲気を伝えるイメージとして扱い、参加者本人を示す写真・人物表象として扱わない。
- 最新の募集、申込、開催可否は募集一覧、募集詳細、問い合わせページで確認できる導線をページ内に置く。

### Header

- ロゴ、主要ナビ、相談CTAを共通化する。
- モバイルはメニューボタンを使い、開閉ラベルとフォーカス状態を明確にする。

### Page Banner

- `src/data/siteContent.ts` の `banner` データから描画する。
- `variant`, `eyebrow`, `title`, `lead`, `image`, `imagePosition`, `primaryCta`, `secondaryCta` をページごとに持つ。
- `Top Hero` と `Standard Banner` 以外の派生を作らない。

### Recruitment Cards

- 参加者募集一覧の静的スナップショットとして表示する。
- `2026-05-12` 確認時点であること、募集状況が変わる可能性、募集詳細で最新確認することを明示する。

### Contact

- 問い合わせ整理ページは送信完了や申込完了に見せない。
- 必要な入力は既存の問い合わせページへ進む導線を主CTAにする。

## Motion

- 下から浮き出るスクロール演出を全ルート共通で許可する。各セクションの本文がスクロールで画面に入った際に、控えめな距離（おおよそ20〜32px）・約0.55秒・ease-outで一度だけ浮上する。`once` 相当で、一度表示したら再生し直さない。
- 浮上演出はモデレート強度に保つ。セクション本文のラッパー単位で、直下要素を軽くstaggerさせる程度までとする。
- ルート切り替え、バナー内の表示、カードhoverも引き続き許可する。
- 跳ねる、回る、無限ループ、パララックスなど視線を過度に奪う装飾モーションは引き続き禁止。
- スクロール演出はプログレッシブエンハンスメントとして実装し、JS無効時やhidden状態が適用されない場合でも本文が必ず表示される状態を保つ。
- `prefers-reduced-motion: reduce` ではスクロール浮上を含む全アニメーションを停止または最小化し、本文を即時表示する。

## Accessibility

- 全ルートに意味のある `document.title` を設定する。
- 画像の `alt` は写真または旧モック参照の意味を説明する。
- フォームの入力欄には可視ラベルを置く。
- キーボードフォーカスは `forest.moss` 系で明確に見せる。
- 色だけで状態を伝えない。

## Definition of Done

- 実DOM正本ルートが実DOMで表示される。
- 3種類のバナー契約から外れた独自バナーがない。
- `#/course`, `#/faq` が共通ヘッダー付き暫定PNG表示として扱われる。
- `npm run build` が成功する。
- Desktop `1440x900` と Mobile `390x844` で主要導線に横スクロールがない。
- CTA、フォームラベル、関連リンク、募集スナップショットの注意書きが実DOMで確認できる。
- 診断キーワードが活動カテゴリ用の案内語として表示され、募集カードの個別条件ラベルとして使われていない。
- `#/voices` はDOM本文で表示され、`voices.png` は参照資産として残っても本文画像としては使われていない。

## 2026-05-14 About Subpage DOM Contract

- `#/about`, `#/about/story`, `#/about/sdgs`, `#/about/staff`, and `#/about/organization` are DOM-rendered pages, not PNG-rendered mockup pages.
- `#/about` is the parent hub for the About section. Detailed content must be split into the subpages `#/about/sdgs`, `#/about/staff`, and `#/about/organization` instead of being concentrated on the parent hub.
- `#/about/story` summarizes the official history page as an origin story. Do not quote long official passages, imply generated imagery is historical evidence, or blur the boundary between pre-1998 university co-op activity and JUON NETWORK after establishment.
- Staff introduction content on `#/about/staff` must use text-only staff cards. Do not add staff portrait images, avatar placeholders, or decorative person imagery.
- `public/assets/mockups/about-subpages-reference.png` is a reference mockup for layout and content grouping only. It is not the active rendering source.
- `public/assets/generated/sdgs-forest-cycle.png` is a generated visual asset for the SDGs page and may be used by `#/about/sdgs`.

## 2026-05-14 Fresh Field Update

- Fresh Field UI keeps the existing `forest` palette as the brand anchor and adds `fresh.sprout`, `fresh.sky`, `fresh.sun`, `fresh.soil`, and `fresh.alert` only as support tokens.
- Generated UI mockups in `public/assets/mockups/generated-ui/` are reference images for visual direction, not factual evidence of real JUON events.
- The redesign should emphasize first-time reassurance, current-event discoverability, scan-friendly cards, and clear official-confirmation paths.

## Factual Integrity Constraints

- Do not invent event titles, dates, locations, participant counts, costs, availability, or operational promises.
- Use existing site data and official links for real activity and recruitment details; generated imagery must remain generic or illustrative.
- Contact flows must not imply that this local site stores personal information or sends a real inquiry form.

## 2026-05-15 Support DOM Contract

- `#/support` is a DOM-rendered support, membership, donation, and participation-guide page, not a PNG-rendered mockup page.
- `public/assets/mockups/support.png` remains a visual reference only.
- Support imagery must avoid identifiable faces. Youth-participation support imagery must show lower-face, body, back-view, or hands-only framing, with no visible eyes.
- The local page must not present itself as a donation/payment/member-registration form. Final membership, donation, event signup, and personal-information submission must go through official JUON pages.
- Generated support images live under `public/assets/generated/support/` and are project-bound assets.

## 2026-05-15 Consult DOM Contract

- `#/consult` is a DOM-rendered consultation guide page, not a PNG-rendered mockup page.
- `public/assets/generated/consult/consult-ui-reference.png` is a generated UI reference only. It is not the active rendering source.
- Generated consult imagery lives under `public/assets/generated/consult/` and may be used for the consultation hero and lower-page landscape support.
- `#/consult` helps visitors sort out the kind of question they have before contacting JUON. It should guide students, individual participants, organizations, schools, host regions, press, and supporters toward the next appropriate route.
- `#/contact` remains the official inquiry gateway. Final confirmation, personal-information entry, and message submission must go through the official JUON contact route or clearly marked official links.
- The local site must not store, transmit, or appear to submit personal information from `#/consult`. Do not add functional inquiry forms, application forms, payment flows, or hidden data collection.
- `#/consult` must preserve links to `#/events`, `#/first-time`, and `#/contact` so visitors can move from consultation sorting to official confirmation.
