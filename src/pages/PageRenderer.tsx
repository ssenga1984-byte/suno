import {
  ArrowRight,
  Backpack,
  CalendarDays,
  Check,
  CircleHelp,
  FilePenLine,
  Leaf,
  Mail,
  Map,
  Mountain,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import { MotionBlock } from "../components/Motion";
import { photoSrc } from "./pageData";
import type { PageContent } from "./types";

type PageRendererProps = {
  page: PageContent;
  goTo: (route: string) => void;
};

const routeByLabel = (label: string) => {
  if (label.includes("はじめて")) return "/first-time";
  if (label.includes("活動")) return "/activities";
  if (label.includes("イベント") || label.includes("開催")) return "/events";
  if (label.includes("森林")) return "/forest-school";
  if (label.includes("田畑")) return "/field-school";
  if (label.includes("地域")) return "/regional";
  if (label.includes("講座")) return "/course";
  if (label.includes("声")) return "/voices";
  if (label.includes("支援") || label.includes("寄付")) return "/support";
  if (label.includes("FAQ")) return "/faq";
  if (label.includes("問い合わせ") || label.includes("フォーム")) return "/contact";
  return "/activities";
};

const homeValues = [
  {
    title: "週末だけでOK",
    body: "日帰りや1泊2日。バイトや授業の合間でも、予定に入れやすい。",
    icon: CalendarDays,
  },
  {
    title: "リアルを体感",
    body: "土や木の手触り、地域の人の話。画面の向こうにはない体験がある。",
    icon: Mountain,
  },
  {
    title: "一人でも平気",
    body: "現地に行けば同世代がいる。気づいたらまた来たくなってる。",
    icon: Users,
  },
];

const homePrograms = [
  {
    title: "森林の楽校",
    body: "森の手入れや間伐を体験。森の役割や循環を、体を動かしながら学ぶ。",
    route: "/forest-school",
    position: "left center",
  },
  {
    title: "田畑の楽校",
    body: "田植え、稲刈り、野菜づくり。農作業を通じて「食」と「地域」のつながりを体感。",
    route: "/field-school",
    position: "center center",
  },
  {
    title: "里山・森林ボランティア入門講座",
    body: "道具の使い方や安全の基礎を学べる講座。はじめての人の第一歩にぴったり。",
    route: "/course",
    position: "right center",
  },
];

const flowSteps = [
  { label: "01", title: "気になる活動を選ぶ", body: "日程・場所・内容をチェック。ピンときたものでOK。", icon: Search },
  { label: "02", title: "サクッと申し込む", body: "フォームで必要事項を送るだけ。持ち物リストも届くから安心。", icon: FilePenLine },
  { label: "03", title: "現地で体験する", body: "地域の人や同世代と一緒に、森や畑で過ごす一日が始まる。", icon: Backpack },
];

const eventCards = [
  { date: "5.24", type: "森林", title: "水源の森 森林の楽校", place: "山梨県", status: "初心者OK" },
  { date: "6.08", type: "農業", title: "ぶどうの丘 田畑の楽校", place: "長野県", status: "学生歓迎" },
  { date: "6.22", type: "講座", title: "森林ボランティア入門講座", place: "東京都", status: "受付中" },
];

export function PageRenderer({ page, goTo }: PageRendererProps) {
  if (page.route === "/") {
    return <HomePage page={page} goTo={goTo} />;
  }

  return <SubPage page={page} goTo={goTo} />;
}

function HomePage({ page, goTo }: PageRendererProps) {
  return (
    <main className="bg-forest-paper">
      <Hero page={page} goTo={goTo} variant="home" />

      <section className="bg-forest-linen py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionTitle title="スマホを置いて、土に触れる週末。" />
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
            {homeValues.map((item, index) => {
              const Icon = item.icon;
              return (
                <MotionBlock
                  key={item.title}
                  delay={index * 0.06}
                  className="px-6 text-center md:border-r md:border-forest-deep/15 last:md:border-r-0"
                >
                  <Icon className="mx-auto h-14 w-14 text-forest-leaf" strokeWidth={1.8} aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-bold tracking-normal text-forest-deep">{item.title}</h3>
                  <p className="mx-auto mt-5 max-w-[18rem] leading-8 text-forest-muted">{item.body}</p>
                </MotionBlock>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f1efe4] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionTitle title="参加できるプログラム" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {homePrograms.map((program, index) => (
              <MotionBlock
                key={program.title}
                delay={index * 0.08}
                className="border border-forest-deep/14 bg-forest-linen shadow-[0_18px_44px_rgba(25,49,31,.08)]"
              >
                <img
                  src={photoSrc.program}
                  alt=""
                  className="h-64 w-full object-cover"
                  style={{ objectPosition: program.position }}
                />
                <div className="p-8">
                  <h3 className="font-serif text-3xl font-medium leading-tight text-forest-deep">{program.title}</h3>
                  <p className="mt-5 min-h-[7.5rem] leading-8 text-forest-muted">{program.body}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["初心者OK", "学生歓迎", "週末開催"].map((tag) => (
                      <span
                        key={tag}
                        className="border border-forest-leaf/45 px-3 py-2 text-xs font-bold text-forest-leaf"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-forest-deep"
                    onClick={() => goTo(program.route)}
                  >
                    詳細を見る
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </MotionBlock>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-linen py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <SectionTitle title="参加まで、たった3ステップ" />
          <div className="mt-12 grid gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="contents">
                  <MotionBlock delay={index * 0.08} className="text-center">
                    <p className="font-serif text-4xl text-forest-deep">{step.label}</p>
                    <div className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full bg-[#e8ead8] text-forest-deep">
                      <Icon size={44} strokeWidth={1.6} aria-hidden="true" />
                    </div>
                    <h3 className="mt-7 text-2xl font-bold text-forest-deep">{step.title}</h3>
                    <p className="mx-auto mt-4 max-w-[18rem] leading-8 text-forest-muted">{step.body}</p>
                  </MotionBlock>
                  {index < flowSteps.length - 1 ? (
                    <ArrowRight className="mx-auto mt-24 hidden text-forest-deep/70 md:block" size={30} strokeWidth={1.4} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 text-center text-forest-linen md:px-10 md:py-24">
        <img className="absolute inset-0 h-full w-full object-cover" src={photoSrc.walk} alt="" />
        <div className="absolute inset-0 bg-forest-deep/76" />
        <MotionBlock className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-medium md:text-5xl">次の週末の活動をチェック</h2>
          <Divider />
          <p className="mx-auto mt-6 max-w-2xl leading-8 text-forest-linen/85">
            週末や長期休暇に参加できるイベントを掲載中。自分に合う活動を見つけよう。
          </p>
          <button
            type="button"
            className="mt-8 inline-flex min-h-14 items-center gap-2 border border-forest-linen px-12 py-4 text-sm font-bold text-forest-linen transition hover:bg-forest-linen hover:text-forest-deep"
            onClick={() => goTo("/events")}
          >
            イベントを見る
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </MotionBlock>
      </section>
    </main>
  );
}

function SubPage({ page, goTo }: PageRendererProps) {
  return (
    <main className="bg-forest-paper">
      <Hero page={page} goTo={goTo} variant="sub" />

      <section className="bg-forest-linen py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
          <MotionBlock>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-forest-gold">{page.eyebrow}</p>
            <h2 className="font-serif text-4xl font-medium leading-tight text-forest-deep md:text-6xl">
              {page.introTitle}
            </h2>
          </MotionBlock>
          <MotionBlock delay={0.08}>
            <p className="text-lg leading-9 text-forest-muted">{page.introBody}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["初心者OK", "学生歓迎", "週末開催"].map((tag) => (
                <span
                  key={tag}
                  className="border border-forest-deep/15 bg-forest-paper px-4 py-3 text-center text-sm font-bold text-forest-deep"
                >
                  {tag}
                </span>
              ))}
            </div>
          </MotionBlock>
        </div>
      </section>

      <section className="bg-[#f1efe4] py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
          <SectionTitle title={page.route === "/activities" ? "参加できるプログラム" : "ここでわかること"} />
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {page.features.map((feature, index) => (
              <MotionBlock
                key={feature.title}
                delay={index * 0.06}
                className="border border-forest-deep/14 bg-forest-linen p-8 shadow-[0_18px_44px_rgba(25,49,31,.07)]"
              >
                <div className="mb-7 inline-grid h-14 w-14 place-items-center rounded-full bg-[#e8ead8] text-forest-leaf">
                  {[<Leaf size={26} />, <Sprout size={26} />, <Map size={26} />][index % 3]}
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-forest-gold">{feature.meta}</p>
                <h3 className="text-2xl font-bold leading-snug text-forest-deep">{feature.title}</h3>
                <p className="mt-5 leading-8 text-forest-muted">{feature.body}</p>
              </MotionBlock>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
        <MotionBlock className="overflow-hidden shadow-[0_28px_70px_rgba(25,49,31,.16)]">
          <img className="aspect-[4/5] w-full object-cover" src={photoSrc.program} alt="森や農山村の活動風景" />
        </MotionBlock>
        <MotionBlock delay={0.08}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest-gold">ステップ</p>
          <h2 className="font-serif text-4xl font-medium leading-tight text-forest-deep md:text-5xl">
            {page.timelineTitle}
          </h2>
          <div className="mt-8 divide-y divide-forest-deep/15">
            {page.timeline.map((item) => (
              <article className="grid grid-cols-[58px_1fr] gap-5 py-6" key={`${item.label}-${item.title}`}>
                <span className="font-serif text-2xl text-forest-gold">{item.label}</span>
                <div>
                  <h3 className="text-lg font-bold text-forest-deep">{item.title}</h3>
                  <p className="mt-2 leading-8 text-forest-muted">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </MotionBlock>
      </section>

      {page.route === "/events" || page.route === "/activities" ? <EventsBlock goTo={goTo} /> : null}
      {page.route === "/faq" || page.route === "/contact" ? <SupportBlock page={page} /> : null}

      <section className="relative mx-auto mb-24 max-w-5xl overflow-hidden px-6 py-16 text-center text-forest-linen md:px-16">
        <img className="absolute inset-0 h-full w-full object-cover" src={photoSrc.walk} alt="" />
        <div className="absolute inset-0 bg-forest-deep/82" />
        <MotionBlock className="relative z-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest-moss">次のアクション</p>
          <h2 className="font-serif text-4xl font-medium leading-tight md:text-5xl">{page.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-forest-linen/82">{page.finalBody}</p>
          <button
            type="button"
            className="mt-8 inline-flex min-h-12 items-center gap-2 border border-forest-linen px-8 py-3 text-sm font-bold text-forest-linen transition hover:bg-forest-linen hover:text-forest-deep"
            onClick={() => goTo(page.route === "/contact" ? "/activities" : "/contact")}
          >
            気軽に聞いてみる
            <ArrowRight size={18} />
          </button>
        </MotionBlock>
      </section>
    </main>
  );
}

function Hero({ page, goTo, variant }: PageRendererProps & { variant: "home" | "sub" }) {
  return (
    <section className="relative grid min-h-[650px] items-center overflow-hidden px-5 py-16 text-forest-linen md:min-h-[760px] md:px-10 lg:px-16">
      <img
        className="absolute inset-0 h-full w-full scale-[1.03] animate-[heroZoom_18s_ease-out_forwards] object-cover"
        src={photoSrc[page.heroPhoto]}
        alt=""
        style={{ objectPosition: page.heroPosition ?? "center" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,39,25,.78),rgba(6,39,25,.43)_48%,rgba(6,39,25,.08)),linear-gradient(180deg,rgba(6,39,25,.05),rgba(6,39,25,.42))]" />
      <MotionBlock className="relative z-10 mx-auto w-full max-w-[1440px]">
        <p className="mb-7 text-xs font-bold uppercase tracking-[0.32em] text-forest-moss md:text-sm">
          {page.eyebrow}
        </p>
        <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[1.16] tracking-normal md:text-7xl lg:text-8xl">
          {page.title}
        </h1>
        <p className="mt-7 max-w-2xl text-base font-bold leading-8 text-forest-linen/92 md:text-lg">{page.lead}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-14 items-center justify-center gap-2 border border-forest-linen bg-transparent px-8 py-4 text-sm font-bold text-forest-linen transition hover:bg-forest-linen hover:text-forest-deep"
            onClick={() => goTo(routeByLabel(page.primaryCta))}
          >
            {page.primaryCta}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          {page.secondaryCta ? (
            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-2 border border-forest-linen bg-transparent px-8 py-4 text-sm font-bold text-forest-linen transition hover:bg-forest-linen hover:text-forest-deep"
              onClick={() => goTo(routeByLabel(page.secondaryCta ?? ""))}
            >
              {page.secondaryCta}
              {variant === "home" ? <ArrowRight size={18} aria-hidden="true" /> : null}
            </button>
          ) : null}
        </div>
      </MotionBlock>
    </section>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2 className="font-serif text-4xl font-medium leading-tight text-forest-deep md:text-5xl">{title}</h2>
      <Divider />
    </div>
  );
}

function Divider() {
  return <span className="mx-auto mt-6 block h-[3px] w-20 bg-forest-gold" />;
}

function EventsBlock({ goTo }: { goTo: (route: string) => void }) {
  return (
    <section className="bg-forest-linen py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-16">
        <SectionTitle title="直近の活動をチェック" />
        <div className="mt-10 grid gap-4">
          {eventCards.map((event) => (
            <article key={event.title} className="grid gap-5 border border-forest-deep/12 bg-forest-paper p-5 md:grid-cols-[92px_1fr_auto] md:items-center">
              <div className="bg-forest-deep px-4 py-3 text-center text-forest-linen">
                <CalendarDays className="mx-auto mb-1" size={18} />
                <strong>{event.date}</strong>
              </div>
              <div>
                <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold text-forest-leaf">
                  <span>{event.type}</span>
                  <span>{event.place}</span>
                  <span>{event.status}</span>
                </div>
                <h3 className="text-xl font-bold text-forest-deep">{event.title}</h3>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 border border-forest-deep/20 px-5 py-3 text-sm font-bold text-forest-deep transition hover:bg-forest-linen"
                type="button"
                onClick={() => goTo("/events")}
              >
                詳細を見る
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportBlock({ page }: { page: PageContent }) {
  if (page.route === "/faq") {
    return (
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:px-10 lg:grid-cols-2 lg:px-16">
        {["一人でも参加して大丈夫？", "初心者でも平気？", "交通費や参加費はかかる？", "雨の日はどうなるの？"].map((q) => (
          <article key={q} className="border border-forest-deep/10 bg-forest-linen p-7">
            <CircleHelp className="mb-4 text-forest-leaf" />
            <h3 className="text-lg font-bold text-forest-deep">{q}</h3>
            <p className="mt-3 leading-8 text-forest-muted">
              詳しくは募集ページをチェックしてね。わからないことがあれば事務局に聞いてみよう。
            </p>
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:px-10 lg:grid-cols-2 lg:px-16">
      <div className="border border-forest-deep/10 bg-forest-linen p-8">
        <Mail className="mb-4 text-forest-leaf" />
        <h3 className="text-2xl font-bold text-forest-deep">聞きたいことを送る</h3>
        <div className="mt-6 grid gap-3">
          {["お名前", "メールアドレス", "お問い合わせ種別", "内容"].map((label) => (
            <div key={label} className="border border-forest-deep/10 bg-forest-paper px-4 py-3 text-forest-muted">
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="border border-forest-deep/10 bg-forest-deep p-8 text-forest-linen">
        <Check className="mb-4 text-forest-moss" />
        <h3 className="text-2xl font-bold">じゅおん通信で情報をキャッチ</h3>
        <p className="mt-4 leading-8 text-forest-linen/80">
          イベント情報や活動レポートをメールでお届けするよ。
        </p>
      </div>
    </section>
  );
}
