export type Account = {
  id: number;
  name: string;
  email: string;
  role: "member" | "admin";
};

export type Course = {
  id: number;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
};

export type IconName =
  | "grid"
  | "book"
  | "graduation"
  | "chart"
  | "journal"
  | "tool"
  | "bot"
  | "users"
  | "settings"
  | "search"
  | "bell"
  | "arrow"
  | "chevron"
  | "clock"
  | "play"
  | "plus"
  | "external";
