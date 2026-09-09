import blessed from 'blessed';
import { t } from '../i18n';
import { getDisplay } from '../terminal';
import { destroyScreen, installSignalCleanup } from './lifecycle';
import { RefreshLoop, startRefreshLoop } from './animation';
import { createSurface } from './surface';

export interface CountdownOptions {
  totalMs: number;
  label: string;
}

// Resolve false on cancellation; reject on render failure. Neither path is a
// completed timer, so callers must not archive a successful work session.
export function showCountdown(options: CountdownOptions): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const screen = blessed.screen({ smartCSR: true, title: 'CACE TIMER', fullUnicode: true });
    const surface = createSurface(screen);
    let loop: RefreshLoop | undefined = undefined;
    let settled = false;
    const disposeSignals = installSignalCleanup(screen);
    screen.once('destroy', () => {
      loop?.dispose();
      disposeSignals();
    });
    const finish = (completed: boolean, error?: unknown): void => {
      if (settled) return;
      settled = true;
      loop?.dispose();
      destroyScreen(screen);
      if (error !== undefined) reject(error);
      else resolve(completed);
    };
    screen.key(['escape', 'q'], () => finish(false));
    screen.key(['C-c'], () => process.emit('SIGINT'));
    screen.on('resize', () => loop?.refresh());
    loop = startRefreshLoop(
      (elapsed) => {
        if (elapsed >= options.totalMs) {
          finish(true);
          return;
        }
        const remaining = Math.max(0, options.totalMs - elapsed);
        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const progress = Math.min(1, elapsed / options.totalMs);
        const width = Math.max(1, Math.min(28, Number(screen.width) - 8));
        const filled = Math.floor(width * progress);
        const bar = '[' + '='.repeat(filled) + '-'.repeat(width - filled) + ']';
        const lines = [
          options.label,
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
          `${bar} ${Math.floor(progress * 100)}%`,
          '',
          t('tui.oneThing'),
        ];
        surface.render('little_smile', elapsed, lines, t('tui.cancel'));
      },
      (error) => finish(false, error),
      getDisplay().animation ? 100 : 200,
    );
    // A zero-duration timer can finish during the first synchronous render.
    if (settled) loop.dispose();
  });
}
