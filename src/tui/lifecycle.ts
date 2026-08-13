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

/**
 * Install a one-shot SIGINT/SIGTERM handler that runs the standard
 * blessed cleanup and then re-raises the signal so process exit
 * reflects the user's intent (exit 130 for SIGINT, 143 for SIGTERM).
 *
 * Idempotent: calling twice replaces the previous handler.
 */
export function installSignalCleanup(screen: Screen): void {
  const cleanup = (signal: NodeJS.Signals): void => {
    destroyScreen(screen);
    // Re-raise so default exit-code semantics apply (130/143).
    // Remove our handler first so we don't recurse.
    process.removeAllListeners(signal);
    process.kill(process.pid, signal);
  };
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('SIGTERM');
  process.once('SIGINT', () => cleanup('SIGINT'));
  process.once('SIGTERM', () => cleanup('SIGTERM'));
}

