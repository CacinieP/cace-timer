import blessed from 'blessed';

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

  // Update timer every 500ms
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, options.totalMs - elapsed);
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

    if (elapsed >= options.totalMs) {
      clearInterval(interval);
      screen.destroy();
      process.stdout.write('\x07'); // bell
      options.onDone();
    }
  }, 500);

  // Handle Ctrl+C
  screen.key(['C-c'], () => {
    clearInterval(interval);
    screen.destroy();
    process.stdout.write('\n');
    process.exit(0);
  });

  screen.render();
}
