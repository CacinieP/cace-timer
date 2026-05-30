import * as fs from 'fs';
import { loadData } from '../data';
import { showCaceSmall } from '../mascot';
import { formatDuration, formatTime } from '../utils';
import { t } from '../i18n';
import { Session } from '../types';

export function cmdExport(options: { format?: string; output?: string }): void {
  const data = loadData();
  const sessions = data.history;

  if (sessions.length === 0) {
    console.log();
    showCaceSmall(t('cmd.export.noData'), 'sleepy');
    console.log();
    return;
  }

  const fmt = options.format || 'csv';
  let output: string;

  if (fmt === 'markdown' || fmt === 'md') {
    output = toMarkdown(sessions);
  } else if (fmt === 'csv') {
    output = toCsv(sessions);
  } else {
    console.log(`\x1b[33m${t('cmd.export.unsupportedFormat')}\x1b[0m`);
    return;
  }

  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    console.log();
    showCaceSmall(t('cmd.export.exportedTo', { path: options.output }), 'happy');
    console.log();
  } else {
    process.stdout.write(output);
  }
}

function toCsv(sessions: Session[]): string {
  const header = 'ID,Task,Start,End,Duration,Tags,Marks\n';
  const rows = sessions
    .map(s => {
      const duration = s.end
        ? formatDuration(new Date(s.end).getTime() - new Date(s.start).getTime())
        : 'running';
      return [
        s.id,
        `"${s.task.replace(/"/g, '""')}"`,
        s.start,
        s.end || '',
        duration,
        s.tags.join(';'),
        s.marks.length.toString(),
      ].join(',');
    })
    .join('\n');
  return header + rows + '\n';
}

function toMarkdown(sessions: Session[]): string {
  let md = `| # | ${t('common.task')} | ${t('common.start')} | ${t('common.duration')} | ${t('common.tags')} |\n`;
  md += '|---|------|-------|----------|------|\n';
  sessions.forEach((s, i) => {
    const duration = s.end
      ? formatDuration(new Date(s.end).getTime() - new Date(s.start).getTime())
      : t('common.running');
    const tags = s.tags.map(tg => '#' + tg).join(' ');
    md += `| ${i + 1} | ${s.task} | ${formatTime(s.start)} | ${duration} | ${tags} |\n`;
  });
  return md;
}
