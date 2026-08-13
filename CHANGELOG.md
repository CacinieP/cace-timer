# Changelog

All notable changes to cace-timer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.3.0] - 2026-08-14

### Added
- `src/tui/lifecycle.ts` — central blessed screen teardown helper:
  - `destroyScreen(screen)` runs `screen.destroy()` + `process.stdin.setRawMode(false)` + `screen.program.showCursor()` + `screen.program.normalCursor()`, each step wrapped in try/catch so partial failures don't leak (race / double-fire safe).
  - `installSignalCleanup(screen)` installs SIGINT/SIGTERM handlers that run cleanup then exit with the conventional signal status (130 / 143 instead of 0). It returns a `dispose()` function so normal screen completion can remove the handlers.
- `src/__tests__/lifecycle.test.ts` — 11 unit tests for the helper covering happy path, non-TTY stdin, throwing destroy, throwing program methods, missing `normalCursor`, SIGINT/SIGTERM exit status, handler idempotency, and disposal.

### Fixed
- **Terminal stays stuck in raw mode after quitting the TUI** (`P0-1`). Every blessed screen (countdown / dashboard / reflection) was calling `screen.destroy()` on exit but never restoring `process.stdin` raw mode or the cursor. blessed does not do this for you — the documented cleanup is up to the caller. After `q` / `Esc` / `Ctrl+C` in any TUI screen the parent shell would frequently get stuck in raw mode until the user ran `stty sane` or opened a new tab.
- **Timer tick exceptions would leak the screen** (`P0-2`). The 500ms tick in `showCountdown` had no try/catch — any throw during render would leave the screen in raw mode. Now wrapped: cleanup runs, `onDone` is called, and the original error is re-thrown asynchronously so Node still reports it.

### Changed
- All TUI exit paths (`q` / `Esc` / `Ctrl+C` / menu keys / countdown completion / reflection submit) now route through `destroyScreen`.
- `tk` (Pomodoro) Ctrl+C exit code: 0 → 130. Same convention as the parent shell's SIGINT. Scripts that chained `tk focus ... && next_step` will now correctly NOT run the next step when the user cancels the timer.
- Pomodoro console-mode (`runCountdown`) Ctrl+C handler: `process.exit(0)` → `process.exit(130)` (130 exit code, no blessed cleanup needed since this path is console-only).
- `showCountdown` 500ms interval: `interval.unref()` so a stray timer can't keep the event loop alive after the screen is destroyed.
- `showCountdown` now disposes its SIGINT/SIGTERM handlers when the timer completes normally or errors, so a finished TUI cannot leak stale signal handlers into later console-mode phases.

## [1.2.0] - 2026-05-31

### Added
- `tk summary` command with --today, --week, --month, --tag options
  - Total sessions, total duration, average duration
  - Tag distribution breakdown with ASCII bars
  - Daily hours bar chart (last 7 days)
  - Top 5 longest tasks
- `tk delete <id | --last>` command to remove history records
- `tk resume <id | --last>` command to resume a completed task as a new session
- `tk export [--format csv|markdown] [--output <file>]` command
- `tk pomodoro <task>` with --work, --break, --rounds options and interactive countdown
- Multi-tag support: `--tag dev --tag api` or `--tag dev,api`
- i18n support: `--lang zh|en`, auto-detect from system locale
- CHANGELOG.md (extracted from README)
- vitest test suite
- ESLint + Prettier

### Fixed
- `substr()` deprecated — replaced with `substring()`
- `saveData` now wraps writes in try-catch
- `tk sync` validates empty path and non-existent directory

### Changed
- Source code split from single file to modular structure
  - src/types.ts, src/mascot.ts, src/i18n.ts, src/utils.ts, src/data.ts, src/parser.ts
  - src/commands/ directory with one file per command
  - src/index.ts as thin entry point

## [1.1.1] - 2024-03-02

### Fixed
- Added `prepare` script (fixes git-based installs)
- Added `types` field for TypeScript consumers
- Fixed efficiency score display when no estimate was set
- Fixed efficiency score table mismatch in README
- Fixed `--limit 0` falsy-zero bug
- Fixed `--estimate` NaN handling
- Added Super Happy mascot state and Windows sync paths to README
- Added uninstall instructions and data format docs to README

## [1.1.0] - 2024-03-01

### Changed
- Restructured repo layout (flat structure, no nested `timekeeper/`)
- Fixed `.gitignore` (dist/ was not properly ignored)
- Fixed CI workflow (was running in wrong directory)
- Added Node 18/20/22 matrix in CI
- Added `engines` field in package.json

## [1.0.0] - 2024-02-28

### Added
- Initial release
- start / mark / stop / status / list / search / sync commands
- CACE mascot animation
- Efficiency scoring
- Cloud sync support
