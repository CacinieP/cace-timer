import { getDisplay } from '../terminal';

/** Check if current terminal supports interactive TUI */
export function isInteractiveTerminal(): boolean {
  return (
    getDisplay().tui &&
    process.env.TERM !== 'dumb' &&
    process.stdin.isTTY === true &&
    process.stdout.isTTY === true
  );
}
