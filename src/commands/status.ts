import { loadData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatTime } from '../utils';
import { t } from '../i18n';

export function cmdStatus(): void {
  const data = loadData();

  console.log();
  showCaceSmall('', data.current ? 'normal' : 'sleepy');

  if (!data.current) {
    console.log();
    console.log(`  ${t('common.idle')}`);
    console.log(`  ${t('cmd.status.useStartToBegin')}`);
    console.log();
    return;
  }

  const elapsed = Date.now() - new Date(data.current.start).getTime();
  console.log();
  console.log(`  ${t('cmd.status.inProgress')}`);
  console.log();
  console.log(`  📌 ${t('common.task')}: ${data.current.task}`);
  console.log(`  🕐 ${t('common.start')}: ${formatTime(data.current.start)}`);
  console.log(`  ⏱  ${t('cmd.mark.elapsed')}: ${formatDuration(elapsed)}`);

  if (data.current.tags.length > 0) {
    console.log(`  🏷  ${t('common.tags')}: ${data.current.tags.join(', ')}`);
  }
  if (data.current.marks.length > 0) {
    console.log(`  📍 ${t('common.marks')}: ${data.current.marks.length}`);
    data.current.marks.forEach((m, i) => {
      console.log(`     ${i + 1}. ${formatTime(m.time)} - ${m.note}`);
    });
  }
  console.log();
}
