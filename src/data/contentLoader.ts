import type { RecruitmentItem, RecruitmentSnapshot } from "../types";
import recruitmentMeta from "../../content/recruitment-meta.json";
import linksData from "../../content/links.json";

type EventJson = {
  title: string;
  date: string;
  startDate: string;
  endDate?: string;
  location: string;
  category: string;
  theme: string;
  regionIds: string[];
  href: string;
  statusNote: string;
  status: "published" | "draft";
  image?: {
    src: string;
    alt: string;
    label: string;
    source?: string;
    safety?: string;
  };
};

export type OfficialLinks = typeof linksData;

const eventModules = import.meta.glob<EventJson>(
  "../../content/events/*.json",
  { eager: true, import: "default" },
);
const allEvents = Object.values(eventModules);

function toMonthLabel(startDate: string): string {
  const [year, month] = startDate.split("-");
  return `${year}年${parseInt(month, 10)}月`;
}

function loadEvents(): RecruitmentItem[] {
  return allEvents
    .filter((e) => e.status === "published")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((e) => ({ ...e, monthLabel: toMonthLabel(e.startDate) }));
}

export function loadRecruitmentSnapshot(): RecruitmentSnapshot {
  return {
    checkedAt: recruitmentMeta.checkedAt,
    officialListUrl: recruitmentMeta.officialListUrl,
    note: recruitmentMeta.note,
    items: loadEvents(),
  };
}

export function loadOfficialLinks(): OfficialLinks {
  return linksData;
}
