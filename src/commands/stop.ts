import { loadData, saveData, calculatePoints, scoreToLevel, pointsToNextLevel, updateStreak } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration } from '../utils';
import { t } from '../i18n';
import { isInteractiveTerminal } from '../tui';
import { showReflectionInput } from '../tui/reflection';

export async function cmdStop(options?: { reflection?: string }): Promise<void> {
  const data = loadData();

  if (!data.current) {
    console.log(`\x1b[33m⚠ ${t('cmd.stop.noActive')}\x1b[0m`);
    return;
  }

  const session = data.current;
  session.end = new Date().toISOString();

  const duration = new Date(session.end).getTime() - new Date(session.start).getTime();
  const durationMinutes = duration / 60000;

  // Calculate efficiency score
  const hasEstimate = session.estimatedMinutes && session.estimatedMinutes > 0;
  let efficiency = -1;
  if (hasEstimate) {
    if (durationMinutes < 0.01) {
      efficiency = 100; // sub-second task = perfect
    } else {
      efficiency = Math.min(100, Math.round((session.estimatedMinutes! / durationMinutes) * 100));
    }
  }

  // Calculate points
  const effForPoints = hasEstimate ? efficiency : 50; // default mid efficiency if no estimate
  const points = calculatePoints(durationMinutes, effForPoints);
  session.pointsEarned = points;

  // Save reflection: CLI flag > TUI input > none
  if (options?.reflection) {
    session.reflection = options.reflection;
  } else if (isInteractiveTerminal()) {
    const result = await showReflectionInput();
    if (result.text) {
      session.reflection = result.text;
    }
  }

  // Update score, streak
  data.score = (data.score || 0) + points;
  updateStreak(data);
  const level = scoreToLevel(data.score);
  const levelProgress = pointsToNextLevel(data.score);

  data.history.unshift(session);
  data.current = null;
  saveData(data);

  console.log();
  showCaceSmall(t('cmd.stop.taskComplete'), 'celebrating');
  console.log();
  console.log('  ┌─────────────────────────────────┐');
  console.log(`  │          ${t('cmd.stop.taskSummary')}            │`);
  console.log('  └─────────────────────────────────┘');
  console.log();
  console.log(`  📌 ${t('common.task')}: ${session.task}`);
  console.log(`  🕐 ${t('common.duration')}: ${formatDuration(duration)}`);
  if (session.tags.length > 0) {
    console.log(`  🏷  ${t('common.tags')}: ${session.tags.join(', ')}`);
  }
  if (session.marks.length > 0) {
    console.log(`  📍 ${t('common.marks')}: ${session.marks.length} ${t('cmd.stop.marksCount')}`);
  }

  // Efficiency display
  if (hasEstimate) {
    let effEmoji = '⭐';
    let effColor = '\x1b[32m';
    if (efficiency < 50) {
      effEmoji = '💀';
      effColor = '\x1b[31m';
    } else if (efficiency < 80) {
      effEmoji = '💪';
      effColor = '\x1b[33m';
    } else if (efficiency >= 100) {
      effEmoji = '🏆';
    }
    console.log(`  ${effEmoji} ${t('cmd.stop.efficiencyScore')}: ${effColor}${efficiency}%\x1b[0m`);
  } else {
    console.log(`  ⏱  ${t('cmd.stop.noEstimate')}`);
  }

  // Points & Level
  console.log(`  \x1b[33m${t('score.earned', { points: String(points) })}\x1b[0m`);
  console.log(`  ${t('cmd.status.level', { level: String(level), score: String(data.score) })}`);
  console.log(`  ${t('score.progress', { current: String(levelProgress.current), needed: String(levelProgress.needed) })}`);

  // Streak
  if (data.streak > 1) {
    console.log(`  ${t('score.streakFire', { days: String(data.streak) })}`);
  } else if (data.streak === 1) {
    console.log(`  ${t('score.newStreak')}`);
  }

  // Reflection
  if (session.reflection) {
    console.log(`  💭 ${session.reflection}`);
  }
  console.log();
}
