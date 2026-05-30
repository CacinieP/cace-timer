// ============ Types ============
export interface Mark {
  time: string;
  note: string;
}

export interface Session {
  id: string;
  start: string;
  end?: string;
  task: string;
  tags: string[];
  marks: Mark[];
  estimatedMinutes?: number;
}

export interface TimeKeeperData {
  syncPath?: string;
  lang?: string;
  current: Session | null;
  history: Session[];
}
