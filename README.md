# cace-timer

[![npm version](https://img.shields.io/npm/v/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![npm downloads](https://img.shields.io/npm/dm/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](package.json)
[![license](https://img.shields.io/npm/l/@cacinie/cace-timer.svg)](https://github.com/CacinieP/cace-timer/blob/main/LICENSE)

A gamified time-tracking CLI with an interactive TUI dashboard, points & levels, and a cute mascot.

```
npm install -g @cacinie/cace-timer
```

```
             ╭╮
       ╭────────────╮
       │   ●    ●   │
       │     ▽      │
       │    ───     │
       ╰──╯      ╯──╯
             ││
       ╭─────┴┴─────╮
      ╱   ╔══════╗   ╲
     │    ║ CACE ║    │
     │    ╚══════╝    │
     ╰───────┬┬───────╯
         ╭───┘└───╮
         │        │
         ╰───┬┬───╯
           ╭─┘└─╮
       CACE TIMER
```

## Features

- **Smart Dashboard** — run `tk` and get a context-aware interactive menu
- **Points & Levels** — earn points for focus, level up from Lv.1 to Lv.99
- **Daily Streaks** — consecutive days of productivity tracked with 🔥
- **Pomodoro Timer** — full-screen TUI countdown with mascot and progress bar
- **Quick Focus** — `tk focus 5/15/30/60` for instant timer
- **Reflection** — record thoughts when completing tasks
- **Statistics** — daily/weekly/monthly reports with ASCII charts
- **Bilingual** — `--lang zh|en`, auto-detects system locale
- **Export** — CSV or Markdown output
- **Cloud Sync** — point data file at Dropbox/iCloud/OneDrive

## Quick Start

```bash
# Open the interactive dashboard
tk

# Or use commands directly
tk start "写周报" --tag work --tag daily --estimate 30
tk mark "完成数据分析"
tk status
tk stop
```

## Smart Dashboard

Running `tk` with no arguments opens an interactive TUI dashboard:

**No active task:**
```
  [CACE mascot — sleepy]
  📊 Lv.2 | 20 pts | 🔥 3 day streak

  [s] 🚀 Start task
  [f] 🍅 Quick focus
  [b] 📊 Statistics
  [l] 📋 History
  [?] ❓ Help
```

**Active task in progress:**
```
  [CACE mascot — focused]
  📊 Lv.2 | 20 pts

  🔥 In progress: 写周报 | Elapsed: 15m 30s

  [m] 📍 Mark checkpoint
  [s] ⏹  Stop task
  [b] 📊 Statistics
  [l] 📋 History
  [?] ❓ Help
```

## Commands

### `tk start <task> [options]`

Start a new task. Supports multiple tags.

| Option | Description |
|--------|-------------|
| `--tag <tag>` | Add tag(s). Repeatable: `--tag dev --tag api` or `--tag dev,api` |
| `--estimate <minutes>` | Estimated duration for efficiency scoring |

### `tk stop [options]`

Stop current task. Shows summary, efficiency score, and points earned.

| Option | Description |
|--------|-------------|
| `--reflection <text>` | Attach a completion note |

In interactive terminals, a TUI input box appears for reflection.

### `tk mark <note>`

Record a time checkpoint within the active task.

### `tk status`

Show current task, level, and streak.

### `tk list [options]`

| Option | Description |
|--------|-------------|
| `--today` | Today only |
| `--tag <tag>` | Filter by tag |
| `--limit <n>` | Limit count (default 10) |

### `tk search <keyword>`

Search across task names, tags, and mark notes.

### `tk summary [options]`

Statistics report with ASCII charts.

| Option | Description |
|--------|-------------|
| `--today` | Today only |
| `--week` | This week (Monday start) |
| `--month` | This month |
| `--tag <tag>` | Filter by tag |

Shows: total sessions, total/average duration, tag distribution bars, daily hours chart (last 7 days), top 5 longest tasks.

### `tk delete <id | --last>`

Delete a session from history.

### `tk resume <id | --last>`

Resume a completed task as a new session.

### `tk export [options]`

| Option | Description |
|--------|-------------|
| `--format csv\|markdown` | Output format (default: csv) |
| `--output <file>` | Write to file (default: stdout) |

### `tk pomodoro <task> [options]`

Full-screen TUI pomodoro timer with mascot, countdown, and encouragement.

| Option | Description |
|--------|-------------|
| `--work <minutes>` | Work duration (default: 25) |
| `--break <minutes>` | Break duration (default: 5) |
| `--rounds <n>` | Number of rounds (default: 4) |
| `--tag <tag>` | Add tag(s) |

### `tk focus <5\|15\|30\|60> [task]`

Quick one-shot focus timer. Shortcut for `tk pomodoro` with 1 round.

### `tk sync <path>`

Set sync file path for cross-device sync.

### `--lang <zh|en>`

Set language. Auto-detects system locale. Persists to config.

### `tk help`

Show full command reference.

## Gamification

### Points System

| Condition | Points |
|-----------|--------|
| Complete a task | +10 |
| Efficiency ≥ 80% | +5 bonus |
| Efficiency = 100% | +5 bonus |
| Deep work (≥ 25 min) | +5 bonus |

### Levels

Progressive XP curve: each level requires `level × 20` more points.

| Level | Total Points |
|-------|-------------|
| 1 | 0 |
| 2 | 20 |
| 3 | 60 |
| 5 | 200 |
| 10 | 900 |

### Daily Streak

Consecutive days with at least one completed task. Break a day and the streak resets.

## CACE Mascot

CACE has 5 moods that change based on context:

| Mood | Eyes | Mouth | When |
|------|------|-------|------|
| Normal | ● ● | ─── | Default display |
| Happy | ★ ★ | ◡◡◡ | Task completed |
| Focused | ◆ ◆ | ▬▬▬ | Pomodoro / active task |
| Celebrating | ◉ ◉ | ▽△▽ | Points earned + arms up |
| Sleepy | ─ ─ | ～～ | No active task |

## Data

All data stored in `~/.cace-timer.json`.

```json
{
  "syncPath": "~/Dropbox/cace-timer.json",
  "lang": "zh",
  "score": 45,
  "streak": 3,
  "lastActiveDate": "2026-05-31",
  "current": null,
  "history": [
    {
      "id": "lq3x9k2",
      "task": "写周报",
      "start": "2026-05-31T10:00:00.000Z",
      "end": "2026-05-31T10:30:00.000Z",
      "tags": ["work", "daily"],
      "marks": [{ "time": "...", "note": "完成数据分析" }],
      "estimatedMinutes": 30,
      "reflection": "今天效率不错",
      "pointsEarned": 20
    }
  ]
}
```

## Uninstall

```bash
npm uninstall -g @cacinie/cace-timer
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT

---

# cace-timer 中文说明

[![npm version](https://img.shields.io/npm/v/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![npm downloads](https://img.shields.io/npm/dm/@cacinie/cace-timer.svg)](https://www.npmjs.com/package/@cacinie/cace-timer)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](package.json)
[![license](https://img.shields.io/npm/l/@cacinie/cace-timer.svg)](https://github.com/CacinieP/cace-timer/blob/main/LICENSE)

游戏化时间追踪 CLI，带交互式 TUI 仪表盘、积分等级系统和可爱吉祥物。

```
npm install -g @cacinie/cace-timer
```

## 特性

- **智能仪表盘** — 输入 `tk` 即可打开上下文感知的交互菜单
- **积分与等级** — 完成任务赚积分，从 Lv.1 升到 Lv.99
- **每日打卡** — 连续天数追踪，显示火焰 🔥
- **番茄钟** — 全屏 TUI 倒计时 + 吉祥物 + 进度条
- **快捷专注** — `tk focus 5/15/30/60` 一键开始
- **完成心得** — 任务完成时记录感想
- **统计报表** — 日/周/月统计，ASCII 柱状图
- **双语支持** — `--lang zh|en`，自动检测系统语言
- **数据导出** — CSV 或 Markdown 格式
- **云同步** — 数据文件指向 Dropbox/iCloud/OneDrive

## 快速开始

```bash
# 打开交互仪表盘
tk

# 或直接用命令
tk start "写周报" --tag work --tag daily --estimate 30
tk mark "完成数据分析"
tk status
tk stop
```

## 智能仪表盘

输入 `tk`（无参数）打开 TUI 仪表盘：

**无活跃任务：**
```
  [CACE 吉祥物 — 困了]
  📊 Lv.2 | 20 积分 | 🔥 连续 3 天

  [s] 🚀 开始任务
  [f] 🍅 快捷专注
  [b] 📊 统计报表
  [l] 📋 历史记录
  [?] ❓ 帮助
```

**有活跃任务：**
```
  [CACE 吉祥物 — 专注中]
  📊 Lv.2 | 20 积分

  🔥 进行中: 写周报 | 已用时: 15m 30s

  [m] 📍 标记进度
  [s] ⏹  停止任务
  [b] 📊 统计报表
  [l] 📋 历史记录
  [?] ❓ 帮助
```

## 命令

### `tk start <任务名> [选项]`

开始新任务，支持多标签。

| 选项 | 说明 |
|------|------|
| `--tag <标签>` | 多标签：`--tag dev --tag api` 或 `--tag dev,api` |
| `--estimate <分钟>` | 预估时长（效率评分） |

### `tk stop [选项]`

停止当前任务，显示摘要、效率评分、获得积分。

| 选项 | 说明 |
|------|------|
| `--reflection <文本>` | 附加完成心得 |

交互终端中会自动弹出输入框。

### `tk mark <备注>`

在活跃任务中记录时间节点。

### `tk status`

显示当前任务、等级和打卡天数。

### `tk list [选项]`

| 选项 | 说明 |
|------|------|
| `--today` | 仅今天 |
| `--tag <标签>` | 按标签筛选 |
| `--limit <数量>` | 限制数量（默认 10） |

### `tk search <关键词>`

搜索任务名称、标签和标记备注。

### `tk summary [选项]`

统计报表，带 ASCII 柱状图。

| 选项 | 说明 |
|------|------|
| `--today` | 仅今天 |
| `--week` | 本周（周一开始） |
| `--month` | 本月 |
| `--tag <标签>` | 按标签筛选 |

### `tk delete <id | --last>`

删除历史记录。

### `tk resume <id | --last>`

恢复已完成任务为新会话。

### `tk export [选项]`

| 选项 | 说明 |
|------|------|
| `--format csv\|markdown` | 输出格式（默认 csv） |
| `--output <文件>` | 输出到文件（默认 stdout） |

### `tk pomodoro <任务名> [选项]`

全屏 TUI 番茄钟，带吉祥物、倒计时和鼓励语。

| 选项 | 说明 |
|------|------|
| `--work <分钟>` | 工作时长（默认 25） |
| `--break <分钟>` | 休息时长（默认 5） |
| `--rounds <数量>` | 轮数（默认 4） |
| `--tag <标签>` | 添加标签 |

### `tk focus <5\|15\|30\|60> [任务名]`

快捷专注，一键启动单轮番茄钟。

### `tk sync <路径>`

设置同步文件路径。

### `--lang <zh|en>`

设置语言，自动检测系统语言，持久化到配置。

### `tk help`

显示完整命令参考。

## 游戏化

### 积分系统

| 条件 | 积分 |
|------|------|
| 完成任务 | +10 |
| 效率 ≥ 80% | +5 奖励 |
| 效率 = 100% | +5 奖励 |
| 深度工作（≥ 25 分钟） | +5 奖励 |

### 等级系统

递增经验曲线：每级需要 `等级 × 20` 积分。

| 等级 | 总积分 |
|------|--------|
| 1 | 0 |
| 2 | 20 |
| 3 | 60 |
| 5 | 200 |
| 10 | 900 |

### 每日打卡

连续每天完成至少一个任务。中断一天则重新计数。

## CACE 吉祥物

CACE 有 5 种心情，根据场景变化：

| 心情 | 眼睛 | 嘴巴 | 时机 |
|------|------|------|------|
| 正常 | ● ● | ─── | 默认显示 |
| 开心 | ★ ★ | ◡◡◡ | 任务完成 |
| 专注 | ◆ ◆ | ▬▬▬ | 番茄钟 / 活跃任务 |
| 庆祝 | ◉ ◉ | ▽△▽ | 获得积分 + 举手 |
| 困了 | ─ ─ | ～～ | 无活跃任务 |

## 数据

所有数据存储在 `~/.cace-timer.json`。

## 卸载

```bash
npm uninstall -g @cacinie/cace-timer
```

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)。

## 许可

MIT
