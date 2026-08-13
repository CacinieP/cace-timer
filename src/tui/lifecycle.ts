import type blessed from 'blessed';

type Screen = blessed.Widgets.Screen;
type ScreenProgram = Screen['program'];

/**
 * Single source of truth for tearing down a blessed screen without
 * leaving the parent TTY in a broken state.
 *
 * blessed calls `process.stdin.setRawMode(true)` on entry but never
 * restores it on `screen.destroy()` — leaving the user's terminal in
 * raw mode after Ctrl+C / quit. This helper runs the documented cleanup
 * chain (`screen.destroy` + raw-mode off + cursor reset) so every exit
 * path (Ctrl+C, q/Esc, timeout, callback throw) behaves the same.
 *
 * Every cleanup step is wrapped in try/catch — screen may already be
 * destroyed (double-fire on race conditions), stdin may not be a TTY,
 * and `screen.program` may have been torn down by blessed itself.
 */
export function destroyScreen(screen: Screen): void {
  try {
    screen.destroy();
  } catch {
    // already destroyed — ignore
  }

  try {
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
  } catch {
    // stdin not writable / already detached — ignore
  }

  // screen.program.showCursor() / normalCursor() exist at runtime but
  // the @types/blessed type def doesn't include them, so call via
  // unknown to keep this file portable across blessed versions.
  const program = screen.program as ScreenProgram & {
    normalCursor?: () => void;
  };

  try {
    program.showCursor();
  } catch {
    // program may be torn down — ignore
  }

  try {
    program.normalCursor?.();
  } catch {
    // ditto
  }
}

let activeDispose: (() => void) | undefined;

/**
 * Install SIGINT/SIGTERM handlers that run the standard blessed cleanup
 * and then exit with the conventional signal status (130 / 143).
 *
 * Returns a `dispose()` function so callers can remove the handlers when
 * the screen is closed normally. Installing again while a previous
 * instance is active disposes that instance first (idempotent replace).
 */
export function installSignalCleanup(screen: Screen): () => void {
  activeDispose?.();

  const cleanup = (signal: NodeJS.Signals): void => {
    dispose();
    destroyScreen(screen);
    const code = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1;
    process.exit(code);
  };

  const onSigint = (): void => cleanup('SIGINT');
  const onSigterm = (): void => cleanup('SIGTERM');
  const dispose = (): void => {
    process.removeListener('SIGINT', onSigint);
    process.removeListener('SIGTERM', onSigterm);
    if (activeDispose === dispose) {
      activeDispose = undefined;
    }
  };

  process.on('SIGINT', onSigint);
  process.on('SIGTERM', onSigterm);
  activeDispose = dispose;

  return dispose;
}
