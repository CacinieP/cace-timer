import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TimeKeeperData } from './types';

// ============ Data Management ============
let DATA_FILE = path.join(os.homedir(), '.cace-timer.json');

export function getDataFile(): string {
  return DATA_FILE;
}

export function setDataFile(p: string): void {
  DATA_FILE = p;
}

function ensureDefaults(data: Partial<TimeKeeperData>): TimeKeeperData {
  return {
    score: data.score ?? 0,
    streak: data.streak ?? 0,
    lastActiveDate: data.lastActiveDate,
    syncPath: data.syncPath,
    lang: data.lang,
    current: data.current ?? null,
    history: data.history ?? [],
  };
}

export function loadData(): TimeKeeperData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return ensureDefaults(JSON.parse(content));
    }
  } catch {
    // Ignore errors, return default
  }
  return ensureDefaults({});
}

export function saveData(data: TimeKeeperData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    throw new Error(`Failed to save data to ${DATA_FILE}: ${(e as Error).message}`);
  }

  // Sync to external path if set
  if (data.syncPath && fs.existsSync(path.dirname(data.syncPath))) {
    try {
      fs.writeFileSync(data.syncPath, JSON.stringify(data, null, 2));
    } catch (e) {
      process.stderr.write(`Warning: sync to ${data.syncPath} failed: ${(e as Error).message}\n`);
    }
  }
}

// ============ Scoring & Streak ============

/** Calculate points earned for a completed session */
export function calculatePoints(
  durationMinutes: number,
  efficiency: number,
): number {
  let points = 10; // base points
  if (efficiency >= 80) points += 5; // efficiency bonus
  if (efficiency >= 100) points += 5; // perfect bonus
  if (durationMinutes >= 25) points += 5; // deep work bonus (25+ min)
  return points;
}

/** Convert total score to level (1-99) */
export function scoreToLevel(score: number): number {
  // Each level needs progressively more points: Lv.N needs N*20 total
  // Lv.1 = 0pts, Lv.2 = 20pts, Lv.3 = 60pts, Lv.4 = 120pts...
  if (score <= 0) return 1;
  let level = 1;
  let totalNeeded = 0;
  while (level < 99) {
    totalNeeded += level * 20;
    if (score < totalNeeded) break;
    level++;
  }
  return level;
}

/** Points needed for next level */
export function pointsToNextLevel(score: number): { current: number; needed: number } {
  const level = scoreToLevel(score);
  let totalForCurrent = 0;
  for (let i = 1; i < level; i++) {
    totalForCurrent += i * 20;
  }
  const totalForNext = totalForCurrent + level * 20;
  return {
    current: score - totalForCurrent,
    needed: level * 20,
  };
}

/** Update streak based on today's date. Call on session completion. */
export function updateStreak(data: TimeKeeperData): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  if (!data.lastActiveDate) {
    data.streak = 1;
    data.lastActiveDate = today;
    return;
  }
  if (data.lastActiveDate === today) return; // already active today

  const last = new Date(data.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / 86400000);

  if (diffDays === 1) {
    data.streak++;
  } else if (diffDays > 1) {
    data.streak = 1;
  }
  data.lastActiveDate = today;
}

/** Get today's date as YYYY-MM-DD */
export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}
