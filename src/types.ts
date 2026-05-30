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
  reflection?: string;     // 完成心得
  pointsEarned?: number;   // 本次获得积分
}

export interface TimeKeeperData {
  syncPath?: string;
  lang?: string;
  score: number;           // 总积分
  streak: number;          // 连续打卡天数
  lastActiveDate?: string; // 上次活跃日期 (YYYY-MM-DD)
  current: Session | null;
  history: Session[];
}
