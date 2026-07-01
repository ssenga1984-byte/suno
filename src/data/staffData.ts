export type StaffCategory = "fullTime" | "partTime" | "fieldDirector";

export type StaffMember = {
  name: string;
  role: string;
  category: StaffCategory;
  summary: string;
};

export type StaffGroup = {
  id: StaffCategory;
  label: string;
  description: string;
  members: StaffMember[];
};

export const staffInfo = {
  checkedAt: "2026-05-13",
  sourceUrl: "https://juon.or.jp/about/about_312.html",
} as const;

export const staffGroups: StaffGroup[] = [
  {
    id: "fullTime",
    label: "常勤職員",
    description: "事務局運営、広報、事業運営を中心に日々の活動を支えるスタッフです。",
    members: [
      {
        name: "鹿住 貴之",
        role: "事務局長（組織運営・渉外・樹恩割り箸等）",
        category: "fullTime",
        summary: "大学生協でのボランティア推進をきっかけに、都市と農山漁村をつなぐ活動を長く担っています。",
      },
      {
        name: "松本 貴久",
        role: "広報担当（事業担当補佐、多摩の森・大自然塾等）",
        category: "fullTime",
        summary: "震災ボランティアへの関心を入口に、活動の魅力を伝える広報と現場支援に関わっています。",
      },
      {
        name: "鈴木 郁",
        role: "事業担当（森林の楽校、樹恩割り箸等）",
        category: "fullTime",
        summary: "学生時代からの縁と自然への思いを背景に、森林や地域に関わる事業を進めています。",
      },
    ],
  },
  {
    id: "partTime",
    label: "非常勤職員",
    description: "各事業の専門性や地域との接点を補い、活動の幅を広げるスタッフです。",
    members: [
      {
        name: "岩下 広和",
        role: "事業担当（森林の楽校・エコサーバー等）",
        category: "partTime",
        summary: "森林資源を活かす社会づくりをテーマに、学びと実践をつなぐ事業を担当しています。",
      },
      {
        name: "遠藤 紗穂里",
        role: "総務担当（事業担当補佐、田畑の楽校等）",
        category: "partTime",
        summary: "表現活動と環境への関心を土台に、総務と事業補佐の両面から活動を支えています。",
      },
      {
        name: "兵頭 英理子",
        role: "ぶどうの丘 田畑の楽校担当",
        category: "partTime",
        summary: "里山保全や登山の経験を活かし、自然を次世代へつなぐ現場づくりに関わっています。",
      },
    ],
  },
  {
    id: "fieldDirector",
    label: "フィールドディレクター",
    description: "各地の森林の楽校・田畑の楽校で、地域と参加者をつなぐ現場スタッフです。",
    members: [
      {
        name: "大本 隆史",
        role: "安曇野 森林の楽校担当",
        category: "fieldDirector",
        summary: "安曇野の景色や食の魅力を、参加者が地域で体験できる場づくりに活かしています。",
      },
      {
        name: "岡本 一朗",
        role: "風の谷 森林の楽校担当",
        category: "fieldDirector",
        summary: "農や食料をめぐる関心を背景に、一次産業を支える人を増やす活動に取り組んでいます。",
      },
      {
        name: "立川 真悟",
        role: "四万十川 森林の楽校担当",
        category: "fieldDirector",
        summary: "高知の林業に根ざした経験をもとに、地域の森林活動を案内しています。",
      },
      {
        name: "中村 淳",
        role: "神の泉／かずさの里（大多喜・睦沢） 森林の楽校担当",
        category: "fieldDirector",
        summary: "山や海、地域の人との関わりを大切にしながら、自然の学びを現場で伝えています。",
      },
      {
        name: "松岡 弘之",
        role: "熊野の棚田 田畑の楽校担当",
        category: "fieldDirector",
        summary: "熊野の棚田での作業や交流を通じて、その土地ならではの体験を届けています。",
      },
      {
        name: "松田 秀明",
        role: "そばの里 森林の楽校担当",
        category: "fieldDirector",
        summary: "富山の里山ガイド経験を活かし、参加者が地域の自然に親しむ機会を支えています。",
      },
      {
        name: "道上 忠之",
        role: "北信りんごの里 田畑の楽校担当",
        category: "fieldDirector",
        summary: "無理なく長く続けられるボランティア参加を、地域の農の現場から支えています。",
      },
      {
        name: "森 庄",
        role: "つばきの里／鳥の栖 森林の楽校担当",
        category: "fieldDirector",
        summary: "関西での活動経験をもとに、地域ごとの出会いと挑戦を楽しめる現場をつくっています。",
      },
    ],
  },
];
