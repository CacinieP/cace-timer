#!/usr/bin/env node

import { isInteractiveTerminal } from './tui';
import { showDashboard, DashboardAction } from './tui/dashboard';
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

// ============ Safe parseInt ============
function safeInt(val: string | boolean | string[] | undefined, fallback: number): number {
  if (typeof val !== 'string') return fallback;
  const n = parseInt(val);
  return isNaN(n) || n <= 0 ? fallback : n;
}

function safeString(val: string | boolean | string[] | undefined): string | undefined {
  return typeof val === 'string' ? val : undefined;
}

// ============ Command Router ============
async function runCommand(command: string, positional: string[], options: Record<string, string | boolean | string[]>): Promise<void> {
  switch (command) {
    case 'start':
      await cmdStart(positional[0] || '', {
        tag: options.tag as string | string[] | undefined,
        estimate: safeInt(options.estimate, 0) || undefined,
      });
      break;

    case 'mark':
      await cmdMark(positional[0] || t('cmd.mark.markPoint'));
      break;

    case 'stop':
      await cmdStop({ reflection: safeString(options.reflection) });
      break;

    case 'status':
      cmdStatus();
      break;

    case 'list':
    case 'ls':
      cmdList({
        today: !!options.today,
        tag: safeString(options.tag),
        limit: options.limit ? safeInt(options.limit, 10) : 10,
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
        tag: safeString(options.tag),
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
      cmdExport({ format: safeString(options.format), output: safeString(options.output) });
      break;

    case 'pomodoro':
      await cmdPomodoro(positional[0] || '', {
        work: options.work ? safeInt(options.work, 25) : undefined,
        break: options.break ? safeInt(options.break, 5) : undefined,
        rounds: options.rounds ? safeInt(options.rounds, 4) : undefined,
        tag: options.tag as string | string[] | undefined,
      });
      break;

    case 'focus': {
      const minutes = positional[0] ? safeInt(positional[0], 25) : 25;
      const focusTask = positional.slice(1).join(' ') || t('cmd.focus.alias');
      await cmdPomodoro(focusTask, {
        work: minutes,
        break: 5,
        rounds: 1,
        tag: options.tag as string | string[] | undefined,
      });
      break;
    }

    case 'help':
      cmdHelp();
      break;

    default:
      console.log(`\x1b[31m${t('error.unknownCommand', { command })}\x1b[0m`);
      console.log(t('error.useHelp'));
  }
}

// ============ Dashboard action handler ============
async function runDashboardAction(action: DashboardAction): Promise<void> {
  switch (action) {
    case 'start': {
      // For dashboard start, use a generic task - user can specify more via CLI
      await cmdStart('', { tag: undefined, estimate: undefined });
      break;
    }
    case 'focus': {
      await cmdPomodoro(t('cmd.focus.alias'), { work: 25, break: 5, rounds: 1, tag: undefined });
      break;
    }
    case 'mark':
      await cmdMark(t('cmd.mark.markPoint'));
      break;
    case 'stop':
      await cmdStop();
      break;
    case 'summary':
      cmdSummary({ today: true });
      break;
    case 'list':
      cmdList({ today: true });
      break;
    case 'help':
      cmdHelp();
      break;
    case 'quit':
      break;
  }
}

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

  // No command → dashboard (interactive) or help (non-interactive)
  if (command === '' || command === '--help' || command === '-h') {
    if (command === '' && isInteractiveTerminal()) {
      const action = await showDashboard();
      await runDashboardAction(action);
      return;
    }
    cmdHelp();
    return;
  }

  await runCommand(command, positional, parsed.options);
}

main().catch(console.error);
