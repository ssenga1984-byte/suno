# JUON NETWORK 実DOM移行 + バナー統一 実装計画

## 目的

「PNGモックを貼っただけ」「ページごとにバナーの作法が違う」印象を解消し、主要導線を信頼できる実DOMサイトとして提供する。

実DOM正本ルートを参加導線の中心にする。`#/course`, `#/faq` は共通ヘッダー付きの暫定PNG表示として残し、主要導線へ戻れる状態にする。

## 実DOM移行契約

- 実DOM正本: `#/`, `#/first-time`, `#/activities`, `#/events`, `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi`, `#/voices`, `#/consult`, `#/contact`, `#/about`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`, `#/support`
- 暫定PNG表示: `#/course`, `#/faq`
- ページデータ正本: `src/data/siteContent.ts`
- 旧モック参照: `public/assets/mockups/*.png`
- 実写素材: `public/assets/photos/*-no-face.png`

実DOM正本ルートでは、見出し、本文、CTA、フォームラベル、募集カード、リンク、注意書きをDOMで持つ。透明ホットスポットやPNG内テキストを操作導線にしない。

## バナー契約

バナーは3種類に固定する。

| 種類 | 用途 | 実装ルール |
|---|---|---|
| Top Hero | `#/` | 大きな写真、濃緑オーバーレイ、主要CTA2つまで。 |
| Standard Banner | 主要下層と暫定下層 | 高さ、余白、見出しサイズ、CTA位置、写真暗幕を共通化する。 |
| CTA Banner | セクション末尾 | 濃緑背景 + 金CTAを共通パターンにする。 |

`src/data/siteContent.ts` の `banner` 情報を正本とする。項目は `variant`, `eyebrow`, `title`, `lead`, `image`, `imagePosition`, `primaryCta`, `secondaryCta`。

## 実装範囲

- `src/App.tsx`
  - hash routeを維持しながら、実DOM正本ルートをReact/Tailwindページとして描画する。
  - 共通Header、PageBanner、CtaBanner、Footer、暫定PNGページを持つ。
  - `mockup-frame` と透明ホットスポットに依存しない。
- `src/data/siteContent.ts`
  - 実DOM正本ページと暫定ページのページ情報、バナー情報、募集スナップショット、関連リンクを集約する。
  - 参加者募集一覧は `2026-05-12` 確認時点の静的スナップショットとして扱う。
- `DESIGN.md`, `docs/qa-checklist.md`
  - PNG正本方針を廃止し、実DOM移行とバナー統一の成功条件へ更新する。

## 募集情報の扱い

- 募集一覧URL: `https://juon.or.jp/news/cate_list.php?a=cate_list&news_cate_id=36`
- 確認日: `2026-05-12`
- 掲載件数: 募集一覧1ページ目の10件
- 表示項目: `date`, `title`, `location`, `category`, `href`, `statusNote`
- 注意書き: 募集状況は変わる可能性があるため、募集一覧または各詳細ページで最新確認する。

## 問い合わせUX

- サイト内の入力欄は送信用フォームではなく、相談内容を整理するUIとして扱う。
- 問い合わせ整理ページは送信完了や申込完了に見せない。
- 主CTAは既存の問い合わせページへ進む導線にする。
- 送信完了風の表示や、未接続なのに送れるように見えるボタンは禁止する。

## 受け入れ基準

- 実DOM正本ルートが実DOMで表示される。
- 実DOM正本ルートに透明ホットスポットやPNGボタン依存が残っていない。
- 実DOM正本ルートのバナーが3種類の契約から外れていない。
- `#/course`, `#/faq` は共通ヘッダー付き暫定PNG表示として扱われ、主要導線へ戻れる。
- `#/voices` はDOM本文で表示され、`public/assets/mockups/voices.png` は参照資産として残っても本文画像として表示されない。
- `#/voices` の匿名体験談は実在個人の逐語発言に見えず、募集一覧または問い合わせページへの確認導線がある。
- 参加者募集10件、最終確認日、募集一覧リンク、各詳細リンクが表示される。
- 問い合わせページは未接続フォームに見えず、既存の問い合わせページへ案内している。
- `npm run build` が成功する。（コードworker担当）

## 検証計画

1. `git diff -- src docs public DESIGN.md` を確認し、既存変更の扱いを把握する。
2. `npm run build` はコードworkerが実行する。Worker 2はドキュメント整合性のみ確認する。
3. Browser Useで Desktop `1440x900` と Mobile `390x844` を確認する。
4. 対象ルートは `#/`, `#/first-time`, `#/activities`, `#/events`, `#/voices`, `#/contact`。
5. 各ルートで `document.title`、主要CTAの `href`、フォームラベル、フォーカスリング、横スクロールなしを確認する。
6. 暫定ルートで共通ヘッダー、暫定ラベル、旧モック表示、主要導線へ戻れることを確認する。`#/voices` では DOM 本文、`document.title`、横スクロールなし、`img[src*="voices.png"]` の本文不在を確認する。
7. UI安全確認で、AIっぽさ、バナー不統一、見せかけCTA、未接続フォーム、モバイル横切れを重点的に見る。

## 2026-05-14 About Subpage Update

About-section routes are part of the DOM migration contract:

- DOM pages: `#/about`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`.
- `#/about` is the parent hub. It should summarize the section and link onward; detailed SDGs, staff, and organization content belongs on the three subpages.
- `#/about/staff` must present staff introductions as text-only cards. Staff images, portraits, avatar placeholders, and generated person imagery are out of scope.
- `public/assets/mockups/about-subpages-reference.png` is a reference mockup only.
- `public/assets/generated/sdgs-forest-cycle.png` is the generated image asset for the SDGs page.
- Code/build execution is handled by the code worker. This document update only records the contract and QA scope.

Additional About Browser Use scope:

- Check `#/about`, `#/about/sdgs`, `#/about/staff`, and `#/about/organization`.
- Check both Desktop `1440x900` and Mobile `390x844`.
- Confirm no horizontal overflow on all four About routes.
- Confirm `document.title` matches each route's page purpose.
- Confirm the header active state follows the About section and does not incorrectly mark unrelated top-level routes.
- Confirm `#/about/staff` contains no staff images, portrait assets, avatar placeholders, or generated person imagery.

## 2026-05-15 Support DOM Update

Support-route implementation is now part of the DOM migration contract:

- DOM pages now include `#/support`.
- `#/support` must render as a React/Tailwind DOM page using `public/assets/generated/support/` images.
- `public/assets/mockups/support.png` remains a reference mockup only.
- Youth-participation imagery on `#/support` must avoid visible eyes, full faces, and identifiable people.
- The page must link to official JUON pages for membership, donation, event signup, and contact; it must not implement local payment, registration, or personal-information submission.

Additional Support Browser Use scope:

- Check `#/support` at Desktop `1440x900` and Mobile `390x844`.
- Confirm no provisional notice or active mockup PNG display remains on `#/support`.
- Confirm no horizontal overflow.
- Confirm `document.title` matches the support page purpose.
- Confirm generated youth imagery is face-safe in the rendered crop.

## 2026-05-16 Voices Source Note Update

The `#/voices` source-note section must keep the anonymous reconstruction notice visible and direct users to the official publication page instead of bundling the local PDF.

- The local `202605.pdf` is a source-checking file only and must not be copied into `public/` or `dist/`.
- The primary confirmation CTA on `#/voices` points to `officialLinks.publication`.
- The section title should use visitor-facing wording such as `出典と確認方法`, not internal wording such as `PDF反映メモ`.
- Build and QA must include a check that no `*.pdf` files exist under `public/` or `dist/`.
