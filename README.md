# cace-timer

[![npm version](https://img.shields.io/npm/v/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![npm downloads](https://img.shields.io/npm/dm/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](package.json)
[![license](https://img.shields.io/npm/l/@cacinie/cace-timer.svg)](https://github.com/CacinieP/cace-timer/blob/main/LICENSE)

A minimal time-tracking CLI for people who want a fast terminal workflow, plain JSON data, and no account system.

```
npm install -g @cacinie/cace-timer
```

## Why cace-timer

- **Fast capture**: start, mark, stop, and search from the terminal
- **Local-first data**: one JSON file at `~/.cace-timer.json`
- **Portable sync**: point the data file at Dropbox, iCloud, OneDrive, or any synced folder
- **Estimate feedback**: compare actual time with your planned duration
- **No dashboard lock-in**: easy to inspect, back up, or migrate

```
  ▄▄▄▄▄▄▄▄▄▄▄▄
 █░░░░░░░░░░░░█
 █░▄▄▄▄▄▄▄▄▄░█
 █░│ ●   ● │░█
 █░│   ▽   │░█
 █░│  ───  │░█
 ╰────────────╯
   CACE TIMER
```

## Quick Start

```bash
# Start a task
tk start "写周报" --tag work --estimate 30

# Mark progress
tk mark "完成数据分析"

# Check status
tk status

# Stop and get efficiency score
tk stop
```

## Commands

### `tk start <task> [options]`

Start a new task.

| Option | Description |
|--------|-------------|
| `--tag <tag>` | Add a tag |
| `--estimate <minutes>` | Estimated duration (for efficiency score) |

```bash
tk start "开发登录功能" --tag coding --estimate 60
```

### `tk mark <note>`

Record a time checkpoint.

```bash
tk mark "完成API接口"
tk mark "开始写测试"
```

### `tk stop`

Stop current task, show summary and efficiency score.

| Score | Emoji | Meaning |
|-------|-------|---------|
| 100% | 🏆 | Actual ≤ Estimate |
| 80-99% | ⭐ | Slightly over or on target |
| 50-79% | 💪 | Moderately over estimate |
| <50% | 💀 | Far over estimate |

Efficiency score is only shown when `--estimate` was set at task start.

### `tk status`

Show current running task.

### `tk list [options]`

View history.

| Option | Description |
|--------|-------------|
| `--today` | Today only |
| `--tag <tag>` | Filter by tag |
| `--limit <n>` | Limit count (default 10) |

```bash
tk list --today
tk list --tag coding --limit 20
```

### `tk search <keyword>`

Search across task names, tags, and mark notes.

```bash
tk search "登录"
```

### `tk sync <path>`

Set sync file path for cross-device sync (Dropbox / iCloud / OneDrive).

```bash
# macOS / Linux
tk sync ~/Dropbox/cace-timer.json
tk sync ~/OneDrive/cace-timer.json

# Windows
tk sync "%USERPROFILE%\Dropbox\cace-timer.json"
tk sync "%USERPROFILE%\OneDrive\cace-timer.json"
```

### `tk help`

Show help.

## CACE Mascot

CACE reacts to what you do:

| State | Eyes | Mouth | When |
|-------|------|-------|------|
| Normal | ● ● | ─── | Default |
| Happy | ★ ★ | ◡◡◡ | Task completed |
| Super Happy | ◉ ◉ | ▽△▽ | Animation frame |
| Sleepy | ─ ─ | ─── | No active task |
| Blink | ─ ─ | ─── | Animation frame |

## Data

All data is stored in `~/.cace-timer.json`. Single JSON file, easy to backup and sync.

```json
{
  "syncPath": "~/Dropbox/cace-timer.json",
  "current": null,
  "history": [
    {
      "id": "lq3x9k2",
      "task": "写周报",
      "start": "2024-03-02T10:00:00.000Z",
      "end": "2024-03-02T10:30:00.000Z",
      "tags": ["work"],
      "marks": [{ "time": "...", "note": "完成数据分析" }],
      "estimatedMinutes": 30
    }
  ]
}
```

## Uninstall

```bash
npm uninstall -g @cacinie/cace-timer
```

## Changelog

### v1.1.1

- Added `prepare` script (fixes git-based installs)
- Added `types` field for TypeScript consumers
- Fixed efficiency score display when no estimate was set
- Fixed efficiency score table mismatch in README
- Fixed `--limit 0` falsy-zero bug
- Fixed `--estimate` NaN handling
- Added Super Happy mascot state and Windows sync paths to README
- Added uninstall instructions and data format to README

### v1.1.0

- Restructured repo layout (flat structure, no nested `timekeeper/`)
- Fixed `.gitignore` (dist/ was not properly ignored)
- Fixed CI workflow (was running in wrong directory)
- Added Node 18/20/22 matrix in CI
- Added `engines` field in package.json

### v1.0.0

- Initial release
- start / mark / stop / status / list / search / sync commands
- CACE mascot animation
- Efficiency scoring
- Cloud sync support

## License

MIT
