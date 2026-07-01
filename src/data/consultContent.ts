import type { CtaLink } from "../types";

export type ConsultType = "student" | "individual" | "corporate" | "school" | "host-region" | "press-support";

export type ConsultIconKey = "sprout" | "users" | "building" | "file" | "trees" | "mail";

export type ConsultContentItem = {
  type: ConsultType;
  title: string;
  shortTitle: string;
  body: string;
  iconKey: ConsultIconKey;
  tone: string;
  accent: string;
  questions: string[];
  concerns: string[];
  preparation: string[];
  routes: CtaLink[];
};

export const consultTypes = [
  "student",
  "individual",
  "corporate",
  "school",
  "host-region",
  "press-support",
] as const satisfies readonly ConsultType[];

export const consultContent: ConsultContentItem[] = [
  {
    type: "student",
    title: "学生として参加したい",
    shortTitle: "学生",
    body: "一人でも、友だちとでも。ゼミやサークルでの関わり方も整理したい方へ。",
    iconKey: "sprout",
    tone: "bg-ui-support-leaf text-ui-text-heading",
    accent: "bg-forest-leaf",
    questions: [
      "個人参加、友人同士、授業・ゼミ・サークルのどれに近いですか。",
      "日帰り、宿泊、継続参加のうち、どこまで検討していますか。",
      "活動証明、交通、持ち物、費用など、先に確認したい点はありますか。",
    ],
    concerns: [
      "はじめてでも入りやすい活動か。",
      "友人や団体で参加する場合の確認先。",
      "学校活動として扱う場合の事前確認。",
    ],
    preparation: [
      "参加したい時期と地域を大まかに決める。",
      "個人参加か、授業・ゼミ・サークル単位かを整理する。",
      "証明書や授業連携が必要な場合は、その条件を問い合わせページで確認する。",
    ],
    routes: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "募集中の活動を見る", href: "/events" },
      { label: "問い合わせページへ", href: "/contact" },
    ],
  },
  {
    type: "individual",
    title: "個人で参加したい",
    shortTitle: "個人",
    body: "一人参加、親子参加、体力面、日帰り参加などを先に見ておきたい方へ。",
    iconKey: "users",
    tone: "bg-ui-surface-sunk text-ui-text-heading",
    accent: "bg-ui-accent",
    questions: [
      "一人参加、親子参加、友人との参加のどれに近いですか。",
      "体を動かす作業、自然体験、地域交流のどれを重視しますか。",
      "日帰り、宿泊、近場など、参加しやすい条件はありますか。",
    ],
    concerns: [
      "一人でも入りやすい雰囲気か。",
      "親子参加や年齢条件の確認が必要か。",
      "体力面や持ち物に無理がないか。",
    ],
    preparation: [
      "気になる活動名と日程を控える。",
      "移動手段、宿泊可否、作業量への不安を整理する。",
      "参加条件は募集詳細で確認する。",
    ],
    routes: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "日程から探す", href: "/events" },
      { label: "問い合わせページへ", href: "/contact" },
    ],
  },
  {
    type: "corporate",
    title: "企業・団体で関わりたい",
    shortTitle: "企業・団体",
    body: "CSR、社員参加、研修、協力や継続支援について知りたい方へ。",
    iconKey: "building",
    tone: "bg-ui-surface-sunk text-ui-text-heading",
    accent: "bg-forest-gold",
    questions: [
      "社員参加、研修、協賛、寄付、プロボノのどれに近いですか。",
      "参加人数、希望時期、日帰り/宿泊、地域の希望はありますか。",
      "CSR/ESG、社内研修、地域連携など、目的はどこにありますか。",
    ],
    concerns: [
      "社員参加と支援・協賛では確認事項が異なる。",
      "安全説明、保険、雨天時対応、写真利用の確認が必要。",
      "実施可否、費用、受け入れ条件は問い合わせページで確認する。",
    ],
    preparation: [
      "想定人数、時期、地域、日帰り/宿泊の希望を整理する。",
      "ボランティア参加、研修、協賛、寄付のどれを優先するか決める。",
      "社内で必要な確認事項や資料の有無をまとめる。",
    ],
    routes: [
      { label: "支援方法を見る", href: "/support" },
      { label: "問い合わせページへ", href: "/contact" },
      { label: "募集中の活動を見る", href: "/events" },
    ],
  },
  {
    type: "school",
    title: "学校として関わりたい",
    shortTitle: "学校",
    body: "授業連携、体験学習、学生団体やゼミ活動で、無理なく参加できる形を相談したい方へ。",
    iconKey: "file",
    tone: "bg-ui-support-leaf text-ui-support-leafText",
    accent: "bg-forest-leaf",
    questions: [
      "授業、ゼミ、学生団体、体験学習のどれに近いですか。",
      "単発参加か、継続的な連携を検討していますか。",
      "実施時期、人数、引率、活動証明などの条件はありますか。",
    ],
    concerns: [
      "教育活動として扱う場合の事前調整。",
      "学生の安全管理や引率体制。",
      "活動証明や事後レポートの扱い。",
    ],
    preparation: [
      "授業名、団体名、参加予定人数を整理する。",
      "希望時期と活動目的を短くまとめる。",
      "必要な証明や学校側の条件を確認しておく。",
    ],
    routes: [
      { label: "はじめての方へ", href: "/first-time" },
      { label: "活動一覧を見る", href: "/activities" },
      { label: "問い合わせページへ", href: "/contact" },
    ],
  },
  {
    type: "host-region",
    title: "受け入れ先として相談したい",
    shortTitle: "受け入れ先",
    body: "地域活動の受け入れ、活動場所、運営協力について、まず相談の入口を作りたい方へ。",
    iconKey: "trees",
    tone: "bg-ui-surface-sunk text-ui-text-muted",
    accent: "bg-ui-text-muted",
    questions: [
      "活動場所、地域団体、運営協力、募集掲載のどれに近いですか。",
      "森林、農地、地域交流など、関わりたい活動領域は何ですか。",
      "受け入れ時期、作業内容、地域側の体制はどこまで決まっていますか。",
    ],
    concerns: [
      "受け入れ条件や現地体制の整理。",
      "参加者募集の可否や掲載方法の確認。",
      "地域側とJUON側の役割分担。",
    ],
    preparation: [
      "地域名、活動場所、想定している作業内容を整理する。",
      "受け入れ可能な時期と人数の目安をまとめる。",
      "地域側の連絡担当や安全管理体制を確認する。",
    ],
    routes: [
      { label: "活動一覧を見る", href: "/activities" },
      { label: "団体概要を見る", href: "/about/organization" },
      { label: "問い合わせページへ", href: "/contact" },
    ],
  },
  {
    type: "press-support",
    title: "報道・支援について相談したい",
    shortTitle: "報道・支援",
    body: "取材、掲載、寄付、会員、継続支援の確認をしたい方へ。",
    iconKey: "mail",
    tone: "bg-ui-surface-sunk text-ui-text-muted",
    accent: "bg-ui-state-info",
    questions: [
      "取材・掲載、寄付、会員、継続支援のどれに近いですか。",
      "活動紹介、写真利用、資料確認など、確認したい対象は何ですか。",
      "すぐ支援したいのか、まず情報を確認したいのか、どちらに近いですか。",
    ],
    concerns: [
      "写真利用や掲載可否は問い合わせページで確認が必要。",
      "寄付・会員登録は既存の入会・寄付ページで手続きする。",
      "支援方法は入会・寄付ページで最新情報を確認する。",
    ],
    preparation: [
      "取材・支援の目的を一文で整理する。",
      "掲載媒体、希望時期、使用したい資料があればまとめる。",
      "寄付・会員・参加支援のどれを知りたいか決める。",
    ],
    routes: [
      { label: "支援方法を見る", href: "/support" },
      { label: "問い合わせページへ", href: "/contact" },
      { label: "既存の問い合わせページへ", href: "https://juon.or.jp/etc/etc_30.html", external: true },
    ],
  },
];

export function isConsultType(value: string | null): value is ConsultType {
  return consultTypes.includes(value as ConsultType);
}
