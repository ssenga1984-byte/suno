# `#/events` PDF写真 出典・安全判断

作成日: 2026-05-13  
対象ページ: `http://127.0.0.1:5173/#/events`  
参照PDF: `C:\Users\sench\remotion-test-work\樹恩\202605.pdf`  
参照ページ画像: `C:\Users\sench\remotion-test-work\樹恩\tmp\pdfs\202605_pages\page_08.png`

## 方針

- 写真は現在募集中イベントの現地写真として断定しない。
- カード上のラベルは `過去活動の様子` にする。
- 名称一致写真は `過去の同名活動イメージ` として扱う。
- 名称不一致写真は、活動カテゴリが近い場合のみ `活動イメージ` として扱う。
- `要許諾確認` の写真は公開資産に入れない。

## 採用・確認表

| 画像ID | 採用先イベント | 公開資産 | PDFページ | PDF上の活動名 | 判定 | 安全判断 | 備考 |
|---|---|---|---|---|---|---|---|
| `pdf-kazenotani-forest` | 風の谷 森林の楽校 | `public/assets/photos/events/pdf-kazenotani-forest.png` | 202605.pdf p.8-9 | No.9 風の谷 森林の楽校 | 採用 | 遠景中心。顔は主題ではない。 | 過去の同名活動イメージ |
| `pdf-hokushin-ringo` | 北信りんごの里 田畑の楽校 | `public/assets/photos/events/pdf-hokushin-ringo.png` | 202605.pdf p.8-9 | No.7 北信りんごの里 田畑の楽校 | 採用 | 集合写真だが顔は小さめ。公開前に最終確認対象。 | 過去の同名活動イメージ |
| `pdf-azumino-tour` | 安曇野ツアー | `public/assets/photos/events/pdf-azumino-tour.png` | 202605.pdf p.8-9 | No.8 安曇野ツアー 2月 | 採用 | 遠景集合。顔は小さいが公開前に最終確認対象。 | 過去の同名活動イメージ |
| `pdf-iijima-farm` | 農業体験＆竹林整備＠飯島農園 | `public/assets/photos/events/pdf-iijima-farm.png` | 202605.pdf p.8-9 | No.3 農業体験＆竹林整備 @ 飯島農園 | 採用 | 後ろ姿・作業中心。 | 過去の同名活動イメージ |
| `pdf-kaminosen-forest` | おしっさまの里 森林の楽校 / そばの里 森林の楽校 | `public/assets/photos/events/pdf-kaminosen-forest.png` | 202605.pdf p.8-9 | No.2 神の泉 森林の楽校 | 採用 | 作業風景中心。顔は主題ではない。 | 森林の楽校の活動イメージ |
| `pdf-forest-volunteer-tokyo` | かずさの里 森林の楽校（睦沢） | `public/assets/photos/events/pdf-forest-volunteer-tokyo.png` | 202605.pdf p.8-9 | No.5 里山・森林ボランティア入門講座 in 東京 | 採用 | 作業風景中心。顔は主題ではない。 | 森林ボランティア活動イメージ |
| `pdf-shimanto-forest` | 四国のへそ 森林の楽校 | `public/assets/photos/events/pdf-shimanto-forest.png` | 202605.pdf p.8-9 | No.14 四万十川 森林の楽校 | 採用 | 遠景・作業風景中心。 | 四国の森林活動イメージ |
| `pdf-okutama-potato` | 熊野の棚田 田畑の楽校 | `public/assets/photos/events/pdf-okutama-potato.png` | 202605.pdf p.8-9 | No.6 おくたま治助芋植付け | 採用 | 手元作業中心。顔は主題ではない。 | 棚田写真ではなく田畑作業イメージ |
| `pdf-workshop-shikoku` | なし | なし | 202605.pdf p.8-9 | No.13 第9期里山・森林ボランティア入門講座 in 四国 | 要許諾確認 | 集合写真で顔が見える。 | 公開資産には入れない |
| `pdf-town-walk` | なし | なし | 202605.pdf p.8-9 | No.10 町並みと民家を訪ねる会 | 要許諾確認 | 集合写真で顔が見える。 | 公開資産には入れない |

## 生成物

- 確認用切り出し: `tmp/events-photo-crops/`
- 確認シート: `tmp/events-pdf-photo-contact-sheet.png`
- 公開資産: `public/assets/photos/events/`

確認用ファイルは `tmp/` 配下のためコミット対象にしない。公開資産とこの文書だけを判断根拠として残す。
