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

---

# cace-timer 中文说明

[![npm version](https://img.shields.io/npm/v/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![npm downloads](https://img.shields.io/npm/dm/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933.svg)](package.json)
[![license](https://img.shields.io/npm/l/@cacinie/cace-timer.svg)](https://github.com/CacinieP/cace-timer/blob/main/LICENSE)

极简时间追踪 CLI，面向想要快速终端工作流、纯 JSON 数据、无账号系统的人。

```
npm install -g @cacinie/cace-timer
```

## 为什么选 cace-timer

- **快速记录**：终端里 start、mark、stop、search 一气呵成
- **本地优先**：数据仅存于 `~/.cace-timer.json` 一个 JSON 文件
- **便携同步**：将数据文件指向 Dropbox、iCloud、OneDrive 或任何同步目录
- **预估反馈**：对比实际用时与计划时长
- **无仪表盘锁定**：随时可查看、备份或迁移

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

## 快速开始

```bash
# 开始一个任务
tk start "写周报" --tag work --estimate 30

# 标记进度
tk mark "完成数据分析"

# 查看状态
tk status

# 停止并获得效率评分
tk stop
```

## 命令

### `tk start <task> [选项]`

开始一个新任务。

| 选项 | 说明 |
|------|------|
| `--tag <tag>` | 添加标签 |
| `--estimate <minutes>` | 预估时长（用于效率评分） |

```bash
tk start "开发登录功能" --tag coding --estimate 60
```

### `tk mark <note>`

记录一个时间节点。

```bash
tk mark "完成API接口"
tk mark "开始写测试"
```

### `tk stop`

停止当前任务，显示摘要和效率评分。

| 评分 | Emoji | 含义 |
|------|-------|------|
| 100% | 🏆 | 实际 ≤ 预估 |
| 80-99% | ⭐ | 略超或刚好达标 |
| 50-79% | 💪 | 中度超出预估 |
| <50% | 💀 | 远超预估 |

效率评分仅在任务开始时设置了 `--estimate` 时显示。

### `tk status`

显示当前运行中的任务。

### `tk list [选项]`

查看历史记录。

| 选项 | 说明 |
|------|------|
| `--today` | 仅今天 |
| `--tag <tag>` | 按标签过滤 |
| `--limit <n>` | 限制数量（默认 10） |

```bash
tk list --today
tk list --tag coding --limit 20
```

### `tk search <keyword>`

搜索任务名称、标签和标记备注。

```bash
tk search "登录"
```

### `tk sync <path>`

设置同步文件路径，用于跨设备同步（Dropbox / iCloud / OneDrive）。

```bash
# macOS / Linux
tk sync ~/Dropbox/cace-timer.json
tk sync ~/OneDrive/cace-timer.json

# Windows
tk sync "%USERPROFILE%\Dropbox\cace-timer.json"
tk sync "%USERPROFILE%\OneDrive\cace-timer.json"
```

### `tk help`

显示帮助。

## CACE 吉祥物

CACE 会根据你的操作做出反应：

| 状态 | 眼睛 | 嘴巴 | 时机 |
|------|------|------|------|
| 正常 | ● ● | ─── | 默认 |
| 开心 | ★ ★ | ◡◡◡ | 任务完成 |
| 超开心 | ◉ ◉ | ▽△▽ | 动画帧 |
| 困了 | ─ ─ | ─── | 无活动任务 |
| 眨眼 | ─ ─ | ─── | 动画帧 |

## 数据

所有数据存储在 `~/.cace-timer.json`，单 JSON 文件，便于备份和同步。

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

## 卸载

```bash
npm uninstall -g @cacinie/cace-timer
```

## 更新日志

### v1.1.1

- 添加 `prepare` 脚本（修复 git 安装问题）
- 添加 `types` 字段（TypeScript 用户）
- 修复未设置预估时效率评分显示问题
- 修复 README 中效率评分表不一致
- 修复 `--limit 0` 的 falsy-zero bug
- 修复 `--estimate` 的 NaN 处理
- README 添加超开心吉祥物状态和 Windows 同步路径
- README 添加卸载说明和数据格式

### v1.1.0

- 重构仓库布局（扁平结构，无嵌套 `timekeeper/`）
- 修复 `.gitignore`（dist/ 未正确忽略）
- 修复 CI 工作流（在错误目录执行）
- CI 添加 Node 18/20/22 矩阵
- package.json 添加 `engines` 字段

### v1.0.0

- 初始发布
- start / mark / stop / status / list / search / sync 命令
- CACE 吉祥物动画
- 效率评分
- 云同步支持

## 许可

MIT
