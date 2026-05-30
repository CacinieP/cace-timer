import { loadData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatTime, formatDate } from '../utils';
import { t } from '../i18n';

export function cmdList(options: { today?: boolean; tag?: string; limit?: number }): void {
  const data = loadData();
  let sessions = data.history;

  // Filter by today
  if (options.today) {
    const today = formatDate(new Date().toISOString());
    sessions = sessions.filter(s => formatDate(s.start) === today);
  }

  // Filter by tag
  if (options.tag) {
    sessions = sessions.filter(s => s.tags.includes(options.tag!));
  }

  // Limit
  const limit = options.limit ?? 10;
  sessions = sessions.slice(0, limit);

  console.log();
  showCaceSmall(t('cmd.list.historyTitle'));
  console.log();

  if (sessions.length === 0) {
    console.log(`  ${t('cmd.list.noRecords')}`);
    console.log();
    return;
  }

  sessions.forEach((session, i) => {
    const duration = session.end
      ? formatDuration(new Date(session.end).getTime() - new Date(session.start).getTime())
      : t('common.running');

    console.log(`  ${i + 1}. ${session.task}`);
    console.log(`     📅 ${formatTime(session.start)} | ⏱ ${duration}`);
    if (session.tags.length > 0) {
      console.log(`     🏷  ${session.tags.map(tg => '#' + tg).join(' ')}`);
    }
    console.log();
  });
}
