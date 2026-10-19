export type Signal = "no-site" | "social-only" | "dead-site" | "has-site";

export type Stage = "new" | "call" | "sent" | "skip";

export type SignalFilter = "open" | "all" | Signal;

export type Lead = {
  id: string;
  name: string;
  city: string;
  district: string;
  category: string;
  address: string;
  rating: number;
  reviews: number;
  signal: Signal;
  phone: string;
  siteUrl: string | null;
  profileUrl: string | null;
  chain: boolean;
  stage: Stage;
};

export type ScorePart = {
  label: string;
  points: number;
};

export type Score = {
  total: number;
  parts: ScorePart[];
};

export type ScoredLead = Lead & {
  score: Score;
};

export type Filters = {
  city: string;
  district: string;
  category: string;
  signal: SignalFilter;
  query: string;
};
