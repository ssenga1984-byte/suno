export type PageRoute =
  | "/"
  | "/first-time"
  | "/activities"
  | "/events"
  | "/forest-school"
  | "/field-school"
  | "/regional"
  | "/course"
  | "/voices"
  | "/about"
  | "/support"
  | "/faq"
  | "/contact";

export type PhotoKey = "hero" | "program" | "walk";

export type FeatureCard = {
  title: string;
  body: string;
  meta?: string;
};

export type TimelineItem = {
  label: string;
  title: string;
  body: string;
};

export type PageContent = {
  route: PageRoute;
  navLabel: string;
  eyebrow: string;
  title: string;
  lead: string;
  heroPhoto: PhotoKey;
  heroPosition?: string;
  primaryCta: string;
  secondaryCta?: string;
  introTitle: string;
  introBody: string;
  features: FeatureCard[];
  timelineTitle: string;
  timeline: TimelineItem[];
  finalTitle: string;
  finalBody: string;
};
