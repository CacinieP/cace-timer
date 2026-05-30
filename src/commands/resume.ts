import { loadData, saveData } from '../data';
import { showCaceAnimation, showCaceSmall } from '../mascot';
import { generateId, formatTime } from '../utils';
import { t } from '../i18n';
import { Session } from '../types';

export async function cmdResume(options: { id?: string; last?: boolean }): Promise<void> {
  const data = loadData();

  if (data.current) {
    console.log(`\x1b[33m⚠ ${t('common.alreadyActive')}\x1b[0m`);
    return;
  }

  if (data.history.length === 0) {
    console.log();
    showCaceSmall(t('cmd.resume.noHistory'), 'sleepy');
    console.log();
    return;
  }

  let source: Session | undefined;
  if (options.last) {
    source = data.history[0];
  } else if (options.id) {
    source = data.history.find(s => s.id === options.id);
  }

  if (!source) {
    console.log();
    showCaceSmall(t('cmd.resume.notFound'), 'sleepy');
    console.log();
    return;
  }

  const session: Session = {
    id: generateId(),
    start: new Date().toISOString(),
    task: source.task,
    tags: [...source.tags],
    marks: [],
    estimatedMinutes: source.estimatedMinutes,
  };

  data.current = session;
  saveData(data);

  await showCaceAnimation(`${t('cmd.resume.resumed', { task: session.task })}`);
  console.log();
  console.log(`  📌 ${t('common.task')}: ${session.task}`);
  if (session.tags.length > 0) {
    console.log(`  🏷  ${t('common.tags')}: ${session.tags.join(', ')}`);
  }
  if (session.estimatedMinutes) {
    console.log(`  ⏱  ${t('common.estimate')}: ${session.estimatedMinutes} min`);
  }
  console.log(`  🕐 ${t('common.start')}: ${formatTime(session.start)}`);
  console.log();
}
