#!/usr/bin/env node

import { parseArgs } from './parser';
import { loadData, saveData } from './data';
import { resolveLocale, setLocale, t } from './i18n';
import { cmdStart } from './commands/start';
import { cmdMark } from './commands/mark';
import { cmdStop } from './commands/stop';
import { cmdStatus } from './commands/status';
import { cmdList } from './commands/list';
import { cmdSearch } from './commands/search';
import { cmdSync } from './commands/sync';
import { cmdHelp } from './commands/help';
import { cmdSummary } from './commands/summary';
import { cmdDelete } from './commands/delete';
import { cmdResume } from './commands/resume';
import { cmdExport } from './commands/export';
import { cmdPomodoro } from './commands/pomodoro';

// ============ Main ============
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  const { command, positional, options } = parsed;

  // Resolve locale before any command runs
  const storedData = loadData();
  const locale = resolveLocale(options.lang as string | undefined, storedData.lang);
  setLocale(locale);

  // Persist language preference if --lang was explicitly given
  if (options.lang) {
    storedData.lang = locale;
    saveData(storedData);
  }

  switch (command) {
    case 'start':
      await cmdStart(positional[0] || '', {
        tag: options.tag as string | string[] | undefined,
        estimate: options.estimate
          ? Number(options.estimate) > 0
            ? parseInt(options.estimate as string)
            : undefined
          : undefined,
      });
      break;

    case 'mark':
      await cmdMark(positional[0] || t('cmd.mark.markPoint'));
      break;

    case 'stop':
      await cmdStop({
        reflection: options.reflection as string | undefined,
      });
      break;

    case 'status':
      cmdStatus();
      break;

    case 'list':
    case 'ls':
      cmdList({
        today: !!options.today,
        tag: options.tag as string,
        limit: options.limit ? parseInt(options.limit as string) : 10,
      });
      break;

    case 'search':
      cmdSearch(positional[0] || '');
      break;

    case 'sync':
      cmdSync(positional[0] || '');
      break;

    case 'summary':
      cmdSummary({
        today: !!options.today,
        week: !!options.week,
        month: !!options.month,
        tag: options.tag as string,
      });
      break;

    case 'delete':
      cmdDelete({
        id: positional[0] && !positional[0].startsWith('--') ? positional[0] : undefined,
        last: !!options.last,
      });
      break;

    case 'resume':
      await cmdResume({
        id: positional[0] && !positional[0].startsWith('--') ? positional[0] : undefined,
        last: !!options.last,
      });
      break;

    case 'export':
      cmdExport({
        format: options.format as string,
        output: options.output as string,
      });
      break;

    case 'pomodoro':
      await cmdPomodoro(positional[0] || '', {
        work: options.work ? parseInt(options.work as string) : undefined,
        break: options.break ? parseInt(options.break as string) : undefined,
        rounds: options.rounds ? parseInt(options.rounds as string) : undefined,
        tag: options.tag as string | string[] | undefined,
      });
      break;

    case 'focus': {
      // Quick focus: tk focus <5|15|30|60> [task]
      const minutes = positional[0] ? parseInt(positional[0]) : 25;
      const focusTask = positional[1] || t('cmd.focus.alias');
      await cmdPomodoro(focusTask, {
        work: minutes,
        break: 5,
        rounds: 1,
        tag: options.tag as string | string[] | undefined,
      });
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    case '':
      cmdHelp();
      break;

    default:
      console.log(`\x1b[31m${t('error.unknownCommand', { command })}\x1b[0m`);
      console.log(t('error.useHelp'));
  }
}

main().catch(console.error);
