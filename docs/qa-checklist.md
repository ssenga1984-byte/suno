# JUON NETWORK 実DOM移行QAチェックリスト

## 基本情報

- 対象: `C:\Users\sench\remotion-test-work\樹恩\juon-site`
- 実DOM正本: `#/`, `#/first-time`, `#/activities`, `#/events`, `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi`, `#/voices`, `#/consult`, `#/contact`, `#/about`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`, `#/support`
- 暫定PNG表示: `#/course`, `#/faq`
- 確認viewport:
  - Desktop: `1440x900`
  - Mobile: `390x844`
- ビルド: `npm run build`（コードworker担当）

## ビルド

- [ ] `npm run build` が成功する。（コードworker担当）
- [ ] TypeScriptエラーがない。
- [ ] Vite buildで画像参照エラーがない。
- [ ] `src/data/siteContent.ts` の型エラーがない。

## 主要DOMルート

- [ ] `#/` が実DOMトップとして表示される。
- [ ] `#/first-time` が実DOMの初参加案内として表示される。
- [ ] `#/activities` が実DOMの活動一覧として表示される。
- [ ] `#/events` が実DOMのイベント一覧として表示される。
- [ ] `#/consult` が実DOMの相談整理ページとして表示される。
- [ ] `#/contact` が実DOMの問い合わせ案内として表示される。
- [ ] `#/voices` が実DOMの匿名体験談イメージページとして表示される。
- [ ] 主要DOMルートに透明ホットスポットや画像内ボタン依存が残っていない。
- [ ] `document.title` が各ページの内容に合っている。
- [ ] `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi` が実DOMの活動詳細ページとして表示される。

## バナー統一

- [ ] `#/` は Top Hero を使っている。
- [ ] `#/first-time`, `#/activities`, `#/events`, `#/contact` は Standard Banner を使っている。
- [ ] セクション末尾CTAは CTA Banner を使っている。
- [ ] CTAの色、形、配置がページごとにばらついていない。
- [ ] 写真上の見出しが読める暗幕になっている。
- [ ] モバイルでバナー内の見出し、本文、CTAが重ならない。

## トップページ物語導線

- [ ] `#/` は Top Hero → Story Steps → Diagnostic Helper → 活動選択 → Voices Preview → Official sources/SNS → CTA Banner の順で表示される。
- [ ] Story Steps は4カード固定で、「気になる」「不安を確認」「活動を選ぶ」「日程を見る」の順路になっている。
- [ ] Diagnostic Helper はStory Stepsの次にあり、「迷った人の補助導線」として読める見出し・導入文になっている。
- [ ] Story Steps と Diagnostic Helper が同じ主導線に見えず、通常の活動一覧・初参加・イベント導線にも進める。
- [ ] Voices Preview は逐語引用に見えない要約・編集表現で、参加者本人を示す写真や発言として誤読されない。
- [ ] Voices Preview から `#/voices` または募集確認導線に進める。
- [ ] 追加コピーに「必ず参加できます」「無料です」「初心者歓迎です」「学生歓迎です」「保険があります」「申し込み完了」「送信できます」などの未確認断定がない。

## 募集情報

- [ ] `#/activities` に募集カード10件が表示される。
- [ ] `#/events` に同じ静的スナップショットが表示される。
- [ ] `#/events?region=...`, `#/events?month=...`, `#/events?theme=...`, `#/events?stay=day` と複合条件で絞り込みできる。
- [ ] 空結果時に条件解除ボタンと募集一覧リンクが表示される。
- [ ] 最終確認日 `2026-05-12` が表示される。
- [ ] 募集一覧URLへのリンクがある。
- [ ] 各募集カードに詳細リンクがある。
- [ ] 「募集状況は募集詳細で確認」という注意書きが表示される。
- [ ] 募集カードに診断キーワードや未確認の受け入れ条件ラベルが追加されていない。

## 問い合わせ

- [ ] 問い合わせページは送信完了風の未接続フォームになっていない。
- [ ] 入力欄には可視ラベルがある。
- [ ] 送信完了や申込完了に見える文言がない。
- [ ] 既存の問い合わせページへの外部リンクがある。
- [ ] 入力内容をこのページで受け付けたように見える表現がない。

## 暫定ルート

- [ ] `#/course` が共通ヘッダー付き暫定表示になっている。
- [ ] `#/about` がDOM親ハブとして表示され、About詳細サブページへ遷移できる。
- [ ] `#/support` がDOM支援ページとして表示され、暫定PNG表示ではない。
- [ ] `#/faq` が共通ヘッダー付き暫定表示になっている。
- [ ] 各暫定ページから活動一覧または問い合わせへ戻れる。

## Responsive / Accessibility

- [ ] Desktop `1440x900` で主要DOMルートに横スクロールがない。
- [ ] Mobile `390x844` で主要DOMルートに横スクロールがない。
- [ ] Headerが本文やCTAを覆わない。
- [ ] モバイルメニューが開閉でき、フォーカス状態が見える。
- [ ] CTA、フォーム、外部リンクがキーボードで到達できる。
- [ ] `prefers-reduced-motion: reduce` で過剰な動きが残らない。
- [ ] 診断UIは6カードすべて選択でき、質問1/2、質問2/2、結果表示、選び直しがキーボードで操作できる。
- [ ] 診断結果に `#/course` が表示されない。
- [ ] 診断結果領域は `aria-live` とフォーカス移動で結果表示を伝える。
- [ ] 活動カテゴリの診断キーワードチップはクリック不可の情報表示で、キーボードフォーカス対象にならない。
- [ ] `#/activities`, `#/forest-school`, `#/field-school`, `#/regional`, `#/waribashi` で診断キーワードが自然に折り返される。
- [ ] `#/voices` 本文に `img[src*="voices.png"]` が存在しない。route data の `mockup` 参照として `voices.png` が残ることは許容する。
- [ ] `#/voices` のカード文言が実在参加者の逐語発言や口コミに見えない。
- [ ] `#/voices` 内から募集一覧または問い合わせページへの確認導線に到達できる。

## UI安全確認

- [ ] AIっぽさが「見た目だけのモック」から来ていない。
- [ ] バナーの見た目が主要ページ間で統一されている。
- [ ] 見せかけCTAがない。
- [ ] 未接続フォームが誤解を生まない。
- [ ] モバイルで右端が切れない。

## 2026-05-14 About DOM QA Addendum

- [ ] `#/about` is a DOM parent hub for the About section.
- [ ] `#/about` links or routes users to `#/about/sdgs`, `#/about/staff`, and `#/about/organization`.
- [ ] `#/about/sdgs` is a DOM page and uses `public/assets/generated/sdgs-forest-cycle.png` only as the SDGs generated visual asset.
- [ ] `#/about/staff` is a DOM page and uses text-only staff cards.
- [ ] `#/about/staff` has no staff photos, portrait images, avatar placeholders, or generated person imagery.
- [ ] `#/about/organization` is a DOM page for organization details.
- [ ] `public/assets/mockups/about-subpages-reference.png` is treated as a reference mockup only, not the active rendering source.
- [ ] Browser Use checks include `#/about`, `#/about/sdgs`, `#/about/staff`, and `#/about/organization`.
- [ ] Desktop `1440x900` has no horizontal overflow on all four About routes.
- [ ] Mobile `390x844` has no horizontal overflow on all four About routes.
- [ ] `document.title` is checked on all four About routes.
- [ ] Header active state marks the About section on all four About routes.
- [ ] Staff image absence is checked on `#/about/staff`.
- [ ] `npm run build` is owned by the code worker; Worker 2 only confirms document consistency.

## 2026-05-15 Support DOM QA Addendum

- [ ] `#/support` is a DOM page, not a provisional PNG page.
- [ ] `#/support` has no provisional notice.
- [ ] `#/support` does not display `public/assets/mockups/support.png` as the active page body.
- [ ] `#/support` uses project-bound generated assets under `public/assets/generated/support/`.
- [ ] Youth-participation imagery on `#/support` has no visible eyes, full faces, or identifiable people.
- [ ] Membership, donation, event, and contact CTAs go to official JUON pages or existing DOM routes as intended.
- [ ] No local payment, registration, donation, or personal-information submission UI is presented as functional.
- [ ] Browser Use checks include `#/support` on Desktop `1440x900` and Mobile `390x844`.
- [ ] Desktop `1440x900` has no horizontal overflow on `#/support`.
- [ ] Mobile `390x844` has no horizontal overflow on `#/support`.
- [ ] `document.title` is checked on `#/support`.

## 2026-05-15 Consult DOM QA Addendum

- [ ] `#/consult` is a DOM page, not a provisional PNG page.
- [ ] `#/consult` has no provisional notice.
- [ ] `#/consult` does not display `public/assets/generated/consult/consult-ui-reference.png` as the active page body.
- [ ] `#/consult` uses project-bound generated assets under `public/assets/generated/consult/`.
- [ ] `#/consult` appears in the primary route data while existing `#/contact` remains available.
- [ ] `#/consult` explains consultation sorting separately from the official inquiry flow.
- [ ] `#/consult` does not present a functional local form, application form, payment flow, or personal-information submission UI.
- [ ] `#/consult` preserves a route to `#/contact` for final official confirmation.
- [ ] `#/consult` links or guides users to `#/events`, `#/first-time`, and `#/contact`.
- [ ] `#/consult?type=student` opens the matching deep-dive panel without top-scroll overriding panel focus.
- [ ] `#/consult?type=foo` is replaced with `#/consult` and does not render a 404 state.
- [ ] Consultation cards use `button` with `aria-expanded` and `aria-controls`, and do not use `aria-pressed`.
- [ ] Only one consultation panel is open at a time; Esc closes the panel and returns the URL to `#/consult`.
- [ ] Browser Back restores the previous consultation `type` state.
- [ ] The corporate deep-dive keeps both `#/contact` and `#/support` routes available.
- [ ] Browser Use checks include `#/consult` on Desktop `1440x900` and Mobile `390x844`.
- [ ] Desktop `1440x900` has no horizontal overflow on `#/consult`.
- [ ] Mobile `390x844` has no horizontal overflow on `#/consult`.

## 2026-05-16 Voices Source Note QA Addendum

- [ ] `#/voices` shows the source-note section with the visitor-facing heading `出典と確認方法`.
- [ ] The source note states that participant voices are anonymous reconstructions based on the 2026 May activity reports, activity diary, and event newsletter items.
- [ ] The source note does not present the participant voices as verbatim quotes from identifiable participants.
- [ ] The primary source CTA uses `officialLinks.publication` and opens the official publication page in a new tab.
- [ ] Recruitment and contact CTAs remain secondary to the publication CTA.
- [ ] No local PDF link, `download` attribute, or PDF size display is added to `#/voices`.
- [ ] `Get-ChildItem public -Recurse -Filter *.pdf` returns no files.
- [ ] After build, `Get-ChildItem dist -Recurse -Filter *.pdf` returns no files.
- [ ] Desktop `1440x900` has no horizontal overflow on `#/voices`.
- [ ] Mobile `390x844` has no horizontal overflow on `#/voices`.
- [ ] `document.title` is checked on `#/consult` and matches `相談する | JUON NETWORK`.
