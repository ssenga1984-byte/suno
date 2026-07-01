import type { DiagnosticKeywordId } from "./data/diagnosticKeywords";

export type SiteRouteId =
  | "home"
  | "first-time"
  | "activities"
  | "events"
  | "consult"
  | "forest-school"
  | "field-school"
  | "regional"
  | "waribashi"
  | "course"
  | "voices"
  | "about"
  | "about-story"
  | "about-sdgs"
  | "about-staff"
  | "about-organization"
  | "support"
  | "faq"
  | "contact";

export type CtaLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ActivityIconKey = "trees" | "sprout" | "map" | "utensils";

export type ActivityDetailColumnKey = "why" | "what" | "before";

export type ActivityDetailColumn = {
  key: ActivityDetailColumnKey;
  title: string;
  items: string[];
};

export type ActivityStorySceneKey = "forest" | "work" | "table";

export type ActivityStoryScene = {
  key: ActivityStorySceneKey;
  title: string;
  body: string;
  sourceIds: string[];
};

export type ActivityStorySection = {
  eyebrow: string;
  title: string;
  lead: string;
  scenes: [ActivityStoryScene, ActivityStoryScene, ActivityStoryScene];
  cta: CtaLink;
};

export type ActivityTheme = {
  accentColor: string;
  iconKey: ActivityIconKey;
  cardText: string;
  keywordIds: DiagnosticKeywordId[];
  image: {
    src: string;
    alt: string;
  };
  details: ActivityDetailColumn[];
  storySection?: ActivityStorySection;
};

export type SiteRoute = {
  id: SiteRouteId;
  path: string;
  navLabel: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  status: "dom" | "provisional";
  banner: {
    variant: "top" | "standard";
    eyebrow: string;
    title: string;
    lead: string;
    image: {
      src: string;
      alt: string;
    };
    imagePosition?: string;
    primaryCta: CtaLink;
    secondaryCta?: CtaLink;
  };
  mockup?: string;
  sections: {
    title: string;
    body: string;
  }[];
  activityTheme?: ActivityTheme;
};

export type RecruitmentItem = {
  date: string;
  startDate: string;
  endDate?: string;
  monthLabel: string;
  title: string;
  location: string;
  category: string;
  theme: string;
  regionIds: string[];
  href: string;
  statusNote: string;
  image?: {
    src: string;
    alt: string;
    label: string;
    source?: string;
    safety?: string;
  };
};

export type RecruitmentSnapshot = {
  checkedAt: string;
  officialListUrl: string;
  note: string;
  items: RecruitmentItem[];
};

export type PermanentInitiative = {
  title: string;
  category: string;
  image: {
    src: string;
    alt: string;
  };
  description: string;
  points: string[];
  statusNote: string;
  href: string;
};

export type RegionActivityGroup = {
  id: string;
  label: string;
  shortLabel: string;
  areaNote: string;
  description: string;
  themes: string[];
  eventCountLabel: string;
};

export type ContactChannel = {
  label: string;
  body: string;
  href?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type DesignTokens = {
  colors: {
    deep: string;
    leaf: string;
    moss: string;
    paper: string;
    linen: string;
    ink: string;
    muted: string;
    gold: string;
  };
};
