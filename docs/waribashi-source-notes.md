# 樹恩割り箸ページ 出典メモ

確認日: 2026-05-24

このメモは `#/waribashi` のストーリー本文に使った根拠を本文単位で追跡するための作業メモです。PDF本体は `public/` や `dist/` に含めません。

| claimId | claim | source | sourceSection | adoptedWording | excludedDetail | renderLocation | checkedAt |
|---|---|---|---|---|---|---|---|
| official-forest-ratio | 日本の森林は国土の約7割で、その約4割は人工林。 | https://juon.or.jp/activity/activity_53.html | なぜ、間伐材・国産材を使うと森林が元気に？ | 日本の国土の約7割は森林で、そのうち約4割は人の手で植えられた人工林です。 | 森林荒廃の詳細描写は長くなるため要約。 | storySection.scenes[forest] | 2026-05-24 |
| official-forest-care | 間伐材・国産材を選ぶことは森林の手入れを支える選択になる。 | https://juon.or.jp/activity/activity_53.html | なぜ、間伐材・国産材を使うと森林が元気に？ | 間伐材や国産材を選ぶことは、価格だけでは測れない森の手入れを支える選択になります。 | 林業衰退の背景説明は詳細ページ側へ委ねる。 | storySection.scenes[forest] | 2026-05-24 |
| official-three-purposes | 樹恩割り箸は森林保全、障害者の仕事づくり、食堂排水を減らす目的で生まれた。 | https://juon.or.jp/activity/activity_53.html | 「樹恩割り箸」で3つのいいこと | 森林保全だけでなく、障害者の仕事づくりに貢献することも、この取り組みが生まれた大切な目的です。 | 排水削減量など未確認の数値は書かない。 | storySection.scenes[work] | 2026-05-24 |
| official-four-facilities | 樹恩割り箸は全国4か所の知的障害者施設で製造されている。 | https://juon.or.jp/activity/activity_53.html | 「樹恩割り箸」で3つのいいこと | 樹恩割り箸は、全国4か所の知的障害者施設で製造されています。 | 施設名は本文に出さず、公式詳細へ誘導。 | storySection.scenes[work] | 2026-05-24 |
| mechanism-workplace | 割り箸づくりを通して障害者の働く場を提供している。 | https://juon.or.jp/nus_im/webapp/data_file_im/html_file/pdf_hashi_info01.pdf | 樹恩割り箸仕組み | つくる仕事が、誰かの毎日になる。 | 仕組み図の全工程は転記せず、本文では仕事づくりに限定。 | storySection.scenes[work] | 2026-05-24 |
| official-coop-count | 樹恩割り箸は全国70以上の大学生協食堂で利用されている。 | https://juon.or.jp/activity/activity_53.html | 「樹恩割り箸」は全国に広がっています | 全国70以上の大学生協食堂で利用され。 | 一般食堂全体へ広く普及しているような表現は避ける。 | storySection.scenes[table] | 2026-05-24 |
| official-green-lantern | 緑提灯店舗にも利用が広がっている。 | https://juon.or.jp/activity/activity_53.html | 「樹恩割り箸」は全国に広がっています | 緑提灯店舗などにも広がっています。 | 店舗数は公式ページ本文で確認できないため書かない。 | storySection.scenes[table] | 2026-05-24 |
| official-bridge | 樹恩割り箸は都市と山村を結ぶかけはしでもある。 | https://juon.or.jp/activity/activity_53.html | 身近な割り箸だから広がるメッセージ | 都市と山村を結ぶかけはしになります。 | 公式表現を超えた成果断定はしない。 | storySection.scenes[table] | 2026-05-24 |
| official-practical-card | 既存の実用カードでも、大学生協食堂中心と緑提灯店舗への広がりを区別する。 | https://juon.or.jp/activity/activity_53.html | 「樹恩割り箸」は全国に広がっています | 全国70以上の大学生協食堂を中心に、緑提灯店舗などにも伝えます。 | 「食堂、団体活動など」のように実績範囲が広く見える表現は避ける。 | activityTheme.details[what] | 2026-05-24 |
| user-pdf-220621032004-8 | ユーザー指定PDF。本文採用候補として確認したが、今回のローカル検証では安定したテキスト抽出ができなかった。 | https://juon.or.jp/nus_im/webapp/data_file_im/220621032004_8.pdf | PDF全体 | 本文には未採用。公式HTMLと仕組みPDFで確認できる事実のみ採用。 | 読み取り不能な表現、価格、施設名、未確認数値は本文に入れない。 | source note only | 2026-05-24 |
