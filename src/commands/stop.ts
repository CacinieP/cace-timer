import { loadData, saveData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration } from '../utils';
import { t } from '../i18n';

export async function cmdStop(): Promise<void> {
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
    efficiency = Math.min(100, Math.round((session.estimatedMinutes! / durationMinutes) * 100));
  }

  data.history.unshift(session);
  data.current = null;
  saveData(data);

  console.log();
  showCaceSmall(t('cmd.stop.taskComplete'), 'happy');
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
  console.log();
}
