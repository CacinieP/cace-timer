// ============ TUI Helpers ============

/** Check if current terminal supports interactive TUI */
export function isInteractiveTerminal(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}
