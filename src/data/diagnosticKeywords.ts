// Shared vocabulary for the diagnostic UI and activity-category keyword chips.
// These labels describe user intent, not per-event acceptance conditions.
export const diagnosticKeywords = {
  first: { id: "first", label: "初めて参加" },
  onsite: { id: "onsite", label: "現地で参加したい" },
  learn: { id: "learn", label: "まず知りたい" },
  nature: { id: "nature", label: "自然体験中心" },
  single: { id: "single", label: "単発から" },
  continue: { id: "continue", label: "継続して学ぶ" },
  field: { id: "field", label: "現場で学びたい" },
  forest: { id: "forest", label: "森林中心" },
  local: { id: "local", label: "地域活動も関心" },
  ask: { id: "ask", label: "条件を相談" },
  support: { id: "support", label: "遠隔から支援" },
  daily: { id: "daily", label: "日常の支援" },
} as const;

export type DiagnosticKeywordId = keyof typeof diagnosticKeywords;
