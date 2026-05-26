# cace-timer

[![npm version](https://img.shields.io/npm/v/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![license](https://img.shields.io/npm/l/@cacinie/cace-timer.svg)](https://github.com/CacinieP/cace-timer/blob/main/LICENSE)

A minimal time tracking CLI with cute anime girl mascot.

```
npm install -g @cacinie/cace-timer
```

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
| 80-99% | 💪 | Slightly over |
| <50% | 💀 | Far over estimate |

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
tk sync ~/Dropbox/cace-timer.json
```

### `tk help`

Show help.

## CACE Mascot

CACE reacts to what you do:

| State | Eyes | Mouth | When |
|-------|------|-------|------|
| Normal | ● ● | ─── | Default |
| Happy | ★ ★ | ◡◡◡ | Task completed |
| Sleepy | ─ ─ | ─── | No active task |
| Blink | ─ ─ | ─── | Animation frame |

## Data

All data is stored in `~/.cace-timer.json`. Single JSON file, easy to backup and sync.

## Changelog

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
