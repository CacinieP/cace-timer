import { loadData, saveData } from '../data';
import { showCaceSmall, CACE_FOCUSED, CACE_HAPPY } from '../mascot';
import { generateId, formatDuration } from '../utils';
import { t } from '../i18n';
import { Session } from '../types';
import { isInteractiveTerminal } from '../tui';
import { showCountdown } from '../tui/countdown';

function getRandomEncouragement(): string {
  const keys = [
    'cmd.focus.encourage1', 'cmd.focus.encourage2', 'cmd.focus.encourage3',
    'cmd.focus.encourage4', 'cmd.focus.encourage5', 'cmd.focus.encourage6',
  ];
  return t(keys[Math.floor(Math.random() * keys.length)]);
}

function normalizeTags(
  rawTag: string | string[] | undefined,
): string[] {
  if (Array.isArray(rawTag)) {
    return rawTag.flatMap(tg => tg.split(',').map(s => s.trim())).filter(Boolean);
  }
  if (typeof rawTag === 'string') {
    return rawTag
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

function formatMsAsClock(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function runCountdown(totalMs: number): Promise<void> {
  return new Promise(resolve => {
    const startTime = Date.now();
    const barWidth = 20;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalMs - elapsed);
      const progress = Math.min(1, elapsed / totalMs);
      const filled = Math.floor(progress * barWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      const elapsedStr = formatMsAsClock(elapsed);
      const totalStr = formatMsAsClock(totalMs);
      process.stdout.write(`\r  [${bar}] ${elapsedStr} / ${totalStr}   `);
      if (elapsed >= totalMs) {
        clearInterval(interval);
        process.stdout.write('\n');
        resolve();
      }
    }, 500);

    // Handle Ctrl+C gracefully
    const onSigint = () => {
      clearInterval(interval);
      process.stdout.write('\n');
      // Note: data is saved in the outer function's scope
      process.exit(0);
    };
    process.once('SIGINT', onSigint);
  });
}

export async function cmdPomodoro(
  task: string,
  options: { work?: number; break?: number; rounds?: number; tag?: string | string[] },
): Promise<void> {
  const data = loadData();

  if (data.current) {
    console.log(`\x1b[33m⚠ ${t('common.alreadyActive')}\x1b[0m`);
    return;
  }

  const workMin = options.work ?? 25;
  const breakMin = options.break ?? 5;
  const rounds = options.rounds ?? 4;
  const tags = [...normalizeTags(options.tag), 'pomodoro'];

  let totalWorkMs = 0;
  let totalBreakMs = 0;

  console.log();
  showCaceSmall(t('cmd.pomodoro.starting'), 'happy');
  console.log();

  for (let round = 1; round <= rounds; round++) {
    // --- Work phase ---
    const workSession: Session = {
      id: generateId(),
      start: new Date().toISOString(),
      task: `${task} (${t('cmd.pomodoro.workPhase')} R${round})`,
      tags,
      marks: [],
      estimatedMinutes: workMin,
    };
    data.current = workSession;
    saveData(data);

    console.log(`  ${t('cmd.pomodoro.round', { round: String(round), total: String(rounds) })} [${t('cmd.pomodoro.workPhase')}]`);
    console.log(`  ${getRandomEncouragement()}`);

    if (isInteractiveTerminal()) {
      // TUI countdown with mascot
      await new Promise<void>(resolve => {
        showCountdown({
          totalMs: workMin * 60 * 1000,
          label: `${t('cmd.pomodoro.round', { round: String(round), total: String(rounds) })} [${t('cmd.pomodoro.workPhase')}]`,
          mascots: [CACE_FOCUSED, CACE_HAPPY],
          onDone: resolve,
        });
      });
    } else {
      await runCountdown(workMin * 60 * 1000);
    }

    // Stop work session
    workSession.end = new Date().toISOString();
    data.history.unshift(workSession);
    data.current = null;
    totalWorkMs += workMin * 60 * 1000;
    saveData(data);

    process.stdout.write('\x07'); // bell
    showCaceSmall(t('cmd.pomodoro.workDone'), 'happy');
    console.log();

    if (round < rounds) {
      // --- Break phase ---
      console.log(`  ${t('cmd.pomodoro.breakTime')}`);
      await runCountdown(breakMin * 60 * 1000);
      totalBreakMs += breakMin * 60 * 1000;
      process.stdout.write('\x07');
      showCaceSmall(t('cmd.pomodoro.breakDone'), 'normal');
      console.log();
    }
  }

  // Final summary
  console.log();
  console.log(`  ${t('cmd.pomodoro.complete')}`);
  console.log(`  ${t('cmd.pomodoro.totalWork')}: ${formatDuration(totalWorkMs)}`);
  console.log(`  ${t('cmd.pomodoro.totalBreak')}: ${formatDuration(totalBreakMs)}`);
  console.log(`  ${t('cmd.pomodoro.roundsCompleted')}: ${rounds}`);
  console.log();
}
