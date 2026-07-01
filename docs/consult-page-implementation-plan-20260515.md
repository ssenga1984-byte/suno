# 相談するページ 実装計画書

## 目的

生成済みUIモック `public/assets/generated/consult/consult-ui-reference.png` を参照し、`#/consult` に独立した「相談する」ページを追加する。
対象は日本向けの JUON NETWORK サイトで、表示テキストは日本語を基本にする。

このページは問い合わせ前の整理ページであり、個人情報を保存・送信するフォームではない。

## 参照素材

- UI参照: `public/assets/generated/consult/consult-ui-reference.png`
- Hero背景: `public/assets/generated/consult/consult-hero-forest-path.png`
- Footer/下部装飾: `public/assets/generated/consult/consult-footer-landscape.png`
- 設計ブリーフ: `docs/consult-page-tone-palette-20260515.md`

## 技術方針

- React + Vite + TypeScript + Tailwind CSS を維持する。
- ユーザー指定の `Tailscale.css` は既存構成から `Tailwind CSS` の意図と解釈する。
- 既存の `forest` トークンを軸にし、相談ページ固有の補助色は局所的に使う。
- アイコンは `lucide-react` を使う。SVGなので背景透過済みとして扱う。
- 画像素材は imagegen で生成した project-bound asset を使用する。
- 既存の未コミット変更は戻さない。

## ビジュアル再現方針

ピクセルレベル忠実を目標にするが、生成UI画像内の日本語テキストは一部不安定なため、実装では正しい日本語DOMテキストを優先する。

再現する主要要素:
- 白い固定ヘッダー、ロゴ、主要ナビ、金色の `相談する` CTA。
- 森の写真ヒーロー、左側の濃緑オーバーレイ、serif H1、大きなCTA 2つ。
- `どの立場で相談しますか` セクション、6分類カード、丸い淡色アイコン背景、右下矢印。
- 淡い緑の `相談前に整理しておくこと` バンド、3ステップカード。
- `次の行動を選ぶ` の3カード。
- 最下部の個人情報非送信ノートと水彩風の山・森装飾。

## 情報設計

相談対象カード:
1. 学生として参加したい
2. 個人で参加したい
3. 企業・団体で関わりたい
4. 学校として関わりたい
5. 受け入れ先として相談したい
6. 報道・支援について相談したい

相談前ステップ:
1. 地域や時期
2. 立場・参加形態
3. 確認したい不安

次の行動:
1. 募集中の活動を見る -> `#/events`
2. はじめての方へ -> `#/first-time`
3. 問い合わせページへ進む -> `#/contact`

## TODO

- [x] imagegenで参照UI、Hero背景、下部装飾をproject-bound assetとして保存する。
- [x] `docs/consult-page-implementation-plan-20260515.md` を実装進行に合わせて更新する。
- [x] `src/types.ts` に `consult` route id を追加する。
- [x] `src/data/siteContent.ts` に consult 用画像パス、`primaryRoutePaths`、`siteRoutes` の `#/consult` データを追加する。
- [x] `src/App.tsx` のヘッダー導線を `#/consult` に変更し、ナビに `相談する` を追加する。
- [x] `src/App.tsx` に `ConsultPage` を追加し、生成モックの構成に沿ってDOM実装する。
- [x] `src/index.css` に相談ページ専用の控えめなアニメーション、hover、背景装飾を追加する。
- [x] `DESIGN.md` に `#/consult` のDOM正本化と問い合わせページとの役割分担を追記する。
- [x] `docs/qa-checklist.md` に `#/consult` の確認観点を追記する。
- [x] `npm run build` を実行する。
- [x] Browser Useで `http://127.0.0.1:5173/#/consult` をdesktop `1440x900` とmobile `390x844` で確認する。
- [x] `#/consult` から `#/contact`, `#/events`, `#/first-time` への導線を確認する。
- [x] UI安全確認を実施し、必要があれば修正する。

## 実装後検証メモ

- `npm run build`: 成功。
- `git diff --check`: 対象ファイルは空白エラーなし。CRLF変換警告のみ。
- Browser Use desktop `1440x900`: `#/consult` のhero、相談対象セクションを確認。
- Browser Use mobile `390x844`: hero、カード表示、固定ヘッダー視認性を確認。ヘッダー背景を不透明化し、カード見出しの不自然な1文字改行を修正。
- 導線確認: `問い合わせページへ` -> `#/contact`、`募集中の活動を見る` -> `#/events`、`はじめての方へ` -> `#/first-time`。
- Console: error/warningなし。

## Worker分担

### Worker A: ルーティング・データ

担当ファイル:
- `src/types.ts`
- `src/data/siteContent.ts`
- `DESIGN.md`
- `docs/qa-checklist.md`

完了条件:
- `consult` route id が型に追加される。
- `#/consult` が `siteRoutes` と主要導線に追加される。
- 既存 `#/contact` は問い合わせページとして残る。
- 公式送信フォームに見せない制約がドキュメントに残る。

### Worker B: 相談ページUI

担当ファイル:
- `src/App.tsx`

完了条件:
- `ConsultPage` が追加される。
- ヘッダーCTAが `#/consult` に向く。
- 6分類カード、3ステップ、次の行動、非送信ノートが表示される。
- lucideアイコンを使用し、SVG透過のまま扱う。

### Worker C: モーション・検証

担当ファイル:
- `src/index.css`
- 必要に応じて `docs/consult-page-implementation-plan-20260515.md`

完了条件:
- ヒーロー、カード、ステップに控えめなリッチアニメーションが入る。
- `prefers-reduced-motion` を尊重する。
- Browser Useでdesktop/mobile確認を行う。
- 検証結果を計画書または最終報告に反映できる形でまとめる。

## 検証基準

- `npm run build` が成功する。
- `#/consult` が直接アクセスできる。
- 日本語テキストが文字化けしない。
- 主要CTAがファーストビュー内で見える。
- モバイルで横スクロールしない。
- 固定ヘッダーが本文やCTAを隠さない。
- ローカルサイトが個人情報を送信できるフォームに見えない。
- `document.title`, 画像 `alt`, リンクの `aria-label` が意味を持つ。
