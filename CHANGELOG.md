# Changelog

All notable changes to cace-timer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

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
