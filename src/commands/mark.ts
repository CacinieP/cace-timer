import { Mark } from '../types';
import { loadData, saveData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatTime } from '../utils';
import { t } from '../i18n';

export async function cmdMark(note: string): Promise<void> {
  const data = loadData();

  if (!data.current) {
    console.log(`\x1b[33m⚠ ${t('cmd.mark.noActive')}\x1b[0m`);
    return;
  }

  const mark: Mark = {
    time: new Date().toISOString(),
    note: note || t('cmd.mark.markPoint'),
  };

  data.current.marks.push(mark);
  saveData(data);

  const elapsed = Date.now() - new Date(data.current.start).getTime();
  console.log();
  showCaceSmall(t('cmd.mark.marked'), 'happy');
  console.log();
  console.log(`  📍 ${formatTime(mark.time)} - ${mark.note}`);
  console.log(`  ⏱  ${t('cmd.mark.elapsed')}: ${formatDuration(elapsed)}`);
  console.log();
}
