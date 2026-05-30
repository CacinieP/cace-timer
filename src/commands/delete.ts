import { loadData, saveData } from '../data';
import { showCaceSmall } from '../mascot';
import { t } from '../i18n';

export function cmdDelete(options: { id?: string; last?: boolean }): void {
  const data = loadData();

  if (data.history.length === 0) {
    console.log();
    showCaceSmall(t('cmd.delete.noHistory'), 'sleepy');
    console.log();
    return;
  }

  if (options.last) {
    const removed = data.history.shift()!;
    saveData(data);
    console.log();
    showCaceSmall(t('cmd.delete.deletedLast', { task: removed.task }), 'normal');
    console.log();
    console.log(`  📌 ${t('common.task')}: ${removed.task}`);
    console.log(`  🆔 ${t('common.id')}: ${removed.id}`);
    console.log();
    return;
  }

  if (options.id) {
    const idx = data.history.findIndex(s => s.id === options.id);
    if (idx === -1) {
      console.log();
      showCaceSmall(t('cmd.delete.notFound'), 'sleepy');
      console.log();
      return;
    }
    const removed = data.history.splice(idx, 1)[0];
    saveData(data);
    console.log();
    showCaceSmall(t('cmd.delete.deleted', { task: removed.task }), 'normal');
    console.log();
    console.log(`  📌 ${t('common.task')}: ${removed.task}`);
    console.log(`  🆔 ${t('common.id')}: ${removed.id}`);
    console.log();
    return;
  }

  // No valid option specified
  console.log();
  showCaceSmall(t('cmd.delete.specify'), 'sleepy');
  console.log();
}
