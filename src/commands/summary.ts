import { loadData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatDate } from '../utils';
import { t } from '../i18n';
import { Session } from '../types';

interface DayHours {
  label: string;
  hours: number;
}

function computeDailyHours(sessions: Session[], days: number): DayHours[] {
  const result: DayHours[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const daySessions = sessions.filter(
      s => s.start >= day.toISOString() && s.start < dayEnd.toISOString(),
    );
    const totalMs = daySessions.reduce(
      (acc, s) => acc + (new Date(s.end!).getTime() - new Date(s.start).getTime()),
      0,
    );
    result.push({
      label: day.toLocaleDateString(getLocale() === 'zh' ? 'zh-CN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      hours: totalMs / 3600000,
    });
  }
  return result;
}

import { getLocale } from '../i18n';

export function cmdSummary(options: {
  today?: boolean;
  week?: boolean;
  month?: boolean;
  tag?: string;
}): void {
  const data = loadData();
  let sessions = data.history.filter(s => s.end); // only completed sessions

  // Time filtering
  const now = new Date();
  if (options.today) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    sessions = sessions.filter(s => s.start >= todayStart);
  } else if (options.week) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    sessions = sessions.filter(s => s.start >= weekStart.toISOString());
  } else if (options.month) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    sessions = sessions.filter(s => s.start >= monthStart);
  } else {
    // Default to today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    sessions = sessions.filter(s => s.start >= todayStart);
  }

  // Tag filtering
  if (options.tag) {
    sessions = sessions.filter(s => s.tags.includes(options.tag!));
  }

  console.log();
  if (sessions.length === 0) {
    showCaceSmall(t('cmd.summary.noData'), 'sleepy');
    console.log();
    return;
  }

  // Compute stats
  const totalSessions = sessions.length;
  const durations = sessions.map(
    s => new Date(s.end!).getTime() - new Date(s.start).getTime(),
  );
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const avgDuration = totalDuration / totalSessions;

  // Tag distribution
  const tagMap = new Map<string, { count: number; ms: number }>();
  for (const s of sessions) {
    const dur = new Date(s.end!).getTime() - new Date(s.start).getTime();
    for (const tag of s.tags) {
      const entry = tagMap.get(tag) || { count: 0, ms: 0 };
      entry.count++;
      entry.ms += dur;
      tagMap.set(tag, entry);
    }
  }

  // Top 5 longest
  const top5 = [...sessions]
    .sort((a, b) => {
      const da = new Date(a.end!).getTime() - new Date(a.start).getTime();
      const db = new Date(b.end!).getTime() - new Date(b.start).getTime();
      return db - da;
    })
    .slice(0, 5);

  // Daily hours bar chart (last 7 days)
  const dailyHours = computeDailyHours(sessions, 7);

  // Render
  showCaceSmall(t('cmd.summary.title'), 'happy');
  console.log();
  console.log(`  ${t('cmd.summary.totalSessions')}: ${totalSessions} ${t('cmd.summary.sessions')}`);
  console.log(`  ${t('cmd.summary.totalDuration')}: ${formatDuration(totalDuration)}`);
  console.log(`  ${t('cmd.summary.avgDuration')}: ${formatDuration(avgDuration)}`);
  console.log();

  // Tag breakdown
  if (tagMap.size > 0) {
    console.log(`  ${t('cmd.summary.tagBreakdown')}:`);
    for (const [tag, { count, ms }] of tagMap) {
      const pct = Math.round((count / totalSessions) * 100);
      const barLen = Math.round(pct / 5); // 20 chars max
      const bar = '█'.repeat(barLen);
      const durStr = formatDuration(ms);
      console.log(`    #${tag}  ${bar} ${count}x (${pct}%) ${durStr}`);
    }
    console.log();
  }

  // Daily bar chart
  console.log(`  ${t('cmd.summary.dailyHours')} (${t('cmd.summary.dailyHoursLabel')}):`);
  const maxHours = Math.max(...dailyHours.map(d => d.hours), 1);
  for (const day of dailyHours) {
    const barWidth = Math.round((day.hours / maxHours) * 20);
    const bar = '█'.repeat(barWidth);
    console.log(`    ${day.label} ${bar} ${day.hours.toFixed(1)}h`);
  }
  console.log();

  // Top 5
  console.log(`  ${t('cmd.summary.top5')}:`);
  top5.forEach((s, i) => {
    const dur = new Date(s.end!).getTime() - new Date(s.start).getTime();
    console.log(`    ${i + 1}. ${s.task} - ${formatDuration(dur)}`);
  });
  console.log();
}
