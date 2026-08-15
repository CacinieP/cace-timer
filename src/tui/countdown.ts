import blessed from 'blessed';
import { destroyScreen, installSignalCleanup } from './lifecycle';

interface CountdownOptions {
  totalMs: number;
  label: string;
  mascots: string[];
  onDone: () => void;
}

export function showCountdown(options: CountdownOptions): void {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'CACE TIMER',
    fullUnicode: true,
  });

  // Mascot display
  const mascotBox = blessed.box({
    parent: screen,
    top: 0,
    left: 'center',
    width: '100%',
    height: 16,
    align: 'center',
    valign: 'middle',
    style: { fg: 'cyan' },
  });

  // Label (round info) — rendered as static content, no box ref needed
  blessed.box({
    parent: screen,
    top: 16,
    left: 'center',
    width: '100%',
    height: 1,
    align: 'center',
    style: { fg: 'white', bold: true },
    content: options.label,
  });

  // Timer display
  const timerBox = blessed.box({
    parent: screen,
    top: 18,
    left: 'center',
    width: '100%',
    height: 3,
    align: 'center',
    valign: 'middle',
    style: { fg: 'cyan', bold: true },
  });

  // Progress bar container
  const progressLabel = blessed.box({
    parent: screen,
    top: 22,
    left: 'center',
    width: '100%',
    height: 1,
    align: 'center',
    style: { fg: 'white' },
  });

  // Controls hint
  blessed.box({
    parent: screen,
    bottom: 0,
    left: 'center',
    width: '100%',
    height: 1,
    align: 'center',
    style: { fg: 'gray' },
    content: 'Ctrl+C to stop',
  });

  // Draw mascot
  if (options.mascots.length > 0) {
    mascotBox.setContent(options.mascots[0]);
  }

  const startTime = Date.now();
  const barWidth = 30;

  // Clean up signal handlers when this screen closes normally.
  const disposeSignalCleanup = installSignalCleanup(screen);

  // Update timer every 500ms
  const interval = setInterval(() => {
    let elapsed = 0;
    let remaining = 0;
    try {
      elapsed = Date.now() - startTime;
      remaining = Math.max(0, options.totalMs - elapsed);
      const progress = Math.min(1, elapsed / options.totalMs);

      // Format time
      const totalSec = Math.floor(remaining / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      // Progress bar
      const filled = Math.floor(progress * barWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      const pct = Math.floor(progress * 100);

      timerBox.setContent(`  ${timeStr}  `);
      progressLabel.setContent(`[${bar}] ${pct}%`);

      // Rotate mascot expression
      if (options.mascots.length > 1) {
        const idx = Math.floor(progress * options.mascots.length) % options.mascots.length;
        mascotBox.setContent(options.mascots[idx]);
      }

      screen.render();
    } catch (err) {
      // Render or content error — don't leave the screen half-updated.
      // Tear down with cleanup, then surface the error to the caller.
      clearInterval(interval);
      disposeSignalCleanup();
      destroyScreen(screen);
      options.onDone();
      // Re-throw asynchronously so Node reports it instead of swallowing it.
      setImmediate(() => {
        throw err;
      });
      return;
    }

    if (elapsed >= options.totalMs) {
      clearInterval(interval);
      disposeSignalCleanup();
      process.stdout.write('\x07'); // bell
      destroyScreen(screen);
      options.onDone();
    }
  }, 500);
  // Don't keep the event loop alive just for the timer.
  if (typeof interval.unref === 'function') interval.unref();

  // Handle Ctrl+C — exit code 130, blessed cleanup included.
  screen.key(['C-c'], () => {
    clearInterval(interval);
    process.stdout.write('\n');
    destroyScreen(screen);
    process.kill(process.pid, 'SIGINT');
  });

  screen.render();
}
