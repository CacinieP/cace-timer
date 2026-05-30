import { loadData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatTime } from '../utils';
import { t } from '../i18n';

export function cmdSearch(keyword: string): void {
  const data = loadData();

  if (!keyword || keyword.trim() === '') {
    console.log();
    showCaceSmall(t('cmd.search.noMatch'), 'sleepy');
    console.log();
    return;
  }

  const results = data.history.filter(
    s =>
      s.task.toLowerCase().includes(keyword.toLowerCase()) ||
      s.tags.some(tg => tg.toLowerCase().includes(keyword.toLowerCase())) ||
      s.marks.some(m => m.note.toLowerCase().includes(keyword.toLowerCase())),
  );

  console.log();
  showCaceSmall(t('cmd.search.searchFor', { keyword }));
  console.log();

  if (results.length === 0) {
    console.log(`  ${t('cmd.search.noMatch')}`);
    console.log();
    return;
  }

  console.log(`  ${t('cmd.search.found', { count: results.length })}\n`);
  results.forEach((session, i) => {
    const duration = session.end
      ? formatDuration(new Date(session.end).getTime() - new Date(session.start).getTime())
      : t('common.running');

    console.log(`  ${i + 1}. ${session.task}`);
    console.log(`     📅 ${formatTime(session.start)} | ⏱ ${duration}`);
    console.log();
  });
}
