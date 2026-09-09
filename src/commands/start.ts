import { paint } from '../terminal';
import { Session } from '../types';
import { loadData, saveData } from '../data';
import { showCaceAnimation, getGreeting } from '../mascot';
import { generateId, formatTime } from '../utils';
import { t } from '../i18n';

export async function cmdStart(
  task: string,
  options: { tag?: string | string[]; estimate?: number },
): Promise<void> {
  const data = loadData();

  if (data.current) {
    console.log(paint(`⚠ ${t('common.alreadyActive')}`, 'yellow'));
    return;
  }

  // Normalize tags: support --tag dev --tag api and --tag dev,api
  let tags: string[] = [];
  const rawTag = options.tag;
  if (Array.isArray(rawTag)) {
    tags = rawTag.flatMap((tag) => tag.split(',').map((s) => s.trim())).filter(Boolean);
  } else if (typeof rawTag === 'string') {
    tags = rawTag
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const session: Session = {
    id: generateId(),
    start: new Date().toISOString(),
    task: task || t('cmd.start.unnamedTask'),
    tags,
    marks: [],
    estimatedMinutes: options.estimate,
  };

  data.current = session;
  saveData(data);

  await showCaceAnimation(`${getGreeting()}！${t('cmd.start.recording')}: ${session.task}`);
  console.log();
  console.log(`  📌 ${t('cmd.start.taskLabel')}: ${session.task}`);
  if (session.tags.length > 0) {
    console.log(`  🏷  ${t('cmd.start.tagLabel')}: ${session.tags.join(', ')}`);
  }
  if (session.estimatedMinutes) {
    console.log(`  ⏱  ${t('cmd.start.estimateLabel')}: ${session.estimatedMinutes} min`);
  }
  console.log(`  🕐 ${t('cmd.start.startLabel')}: ${formatTime(session.start)}`);
  console.log();
}
