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
- **Statistics**: daily/weekly/monthly reports with ASCII charts
- **Pomodoro**: built-in pomodoro timer with work/break cycles
- **Bilingual**: Chinese and English UI with `--lang` flag
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
# Start a task (multi-tag supported!)
tk start "写周报" --tag work --tag daily --estimate 30

# Mark progress
tk mark "完成数据分析"

# Check status
tk status

# Stop and get efficiency score
tk stop

# View statistics
tk summary --today
tk summary --week --tag work

# Export to CSV
tk export --format csv --output report.csv
```

## Commands

### `tk start <task> [options]`

Start a new task. Supports multiple tags.

| Option | Description |
|--------|-------------|
| `--tag <tag>` | Add tag(s). Use multiple times or comma-separated: `--tag dev --tag api` or `--tag dev,api` |
| `--estimate <minutes>` | Estimated duration (for efficiency score) |

```bash
tk start "开发登录功能" --tag coding --tag backend --estimate 60
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

### `tk summary [options]`

Statistics report with ASCII bar charts.

| Option | Description |
|--------|-------------|
| `--today` | Today only |
| `--week` | This week |
| `--month` | This month |
| `--tag <tag>` | Filter by tag |

Shows: total sessions, total/average duration, tag distribution with bars, daily hours chart (last 7 days), top 5 longest tasks.

```bash
tk summary --today
tk summary --week --tag coding
tk summary --month
```

### `tk delete <id | --last>`

Delete a session from history.

```bash
tk delete --last          # Delete most recent record
tk delete lq3x9k2         # Delete by ID
```

### `tk resume <id | --last>`

Resume a completed task as a new session (copies task name and tags).

```bash
tk resume --last          # Resume most recent task
tk resume lq3x9k2         # Resume by ID
```

### `tk export [options]`

Export history to CSV or Markdown.

| Option | Description |
|--------|-------------|
| `--format csv\|markdown` | Output format (default: csv) |
| `--output <file>` | Write to file (default: stdout) |

```bash
tk export                           # CSV to stdout
tk export --format markdown         # Markdown table to stdout
tk export --format csv --output report.csv
```

### `tk pomodoro <task> [options]`

Run pomodoro work/break cycles with interactive countdown.

| Option | Description |
|--------|-------------|
| `--work <minutes>` | Work duration (default: 25) |
| `--break <minutes>` | Break duration (default: 5) |
| `--rounds <n>` | Number of rounds (default: 4) |
| `--tag <tag>` | Add tag(s) |

Each work phase creates a real session (tagged `pomodoro`) that appears in `tk list` and `tk summary`.

```bash
tk pomodoro "写代码" --work 25 --break 5 --rounds 4 --tag coding
```

### `tk sync <path>`

Set sync file path for cross-device sync (Dropbox / iCloud / OneDrive).

```bash
# macOS / Linux
tk sync ~/Dropbox/cace-timer.json
tk sync ~/OneDrive/cace-timer.json

# Windows
tk sync "%USERPROFILE%\Dropbox\cace-timer.json"
```

### `--lang <zh|en>`

Set language. Auto-detects from system locale. Persists to config.

```bash
tk --lang en help
tk --lang zh status
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
  "lang": "zh",
  "current": null,
  "history": [
    {
      "id": "lq3x9k2",
      "task": "写周报",
      "start": "2024-03-02T10:00:00.000Z",
      "end": "2024-03-02T10:30:00.000Z",
      "tags": ["work", "daily"],
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

See [CHANGELOG.md](CHANGELOG.md) for release history.

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
- **统计报表**：日/周/月统计，ASCII 图表，标签分布
- **番茄钟**：内置番茄钟，工作/休息循环
- **双语支持**：`--lang` 参数切换中英文
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
# 开始一个任务（支持多标签！）
tk start "写周报" --tag work --tag daily --estimate 30

# 标记进度
tk mark "完成数据分析"

# 查看状态
tk status

# 停止并获得效率评分
tk stop

# 查看统计
tk summary --today
tk summary --week --tag work

# 导出 CSV
tk export --format csv --output report.csv
```

## 命令

### `tk start <task> [选项]`

开始一个新任务。支持多标签。

| 选项 | 说明 |
|------|------|
| `--tag <tag>` | 添加标签。可多次使用或逗号分隔：`--tag dev --tag api` 或 `--tag dev,api` |
| `--estimate <minutes>` | 预估时长（用于效率评分） |

```bash
tk start "开发登录功能" --tag coding --tag backend --estimate 60
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

### `tk summary [选项]`

统计报表，带 ASCII 柱状图。

| 选项 | 说明 |
|------|------|
| `--today` | 仅今天 |
| `--week` | 本周 |
| `--month` | 本月 |
| `--tag <tag>` | 按标签筛选 |

显示：总会话数、总/平均时长、标签分布柱状图、每日时长图表（近 7 天）、最长任务 Top 5。

```bash
tk summary --today
tk summary --week --tag coding
tk summary --month
```

### `tk delete <id | --last>`

从历史记录中删除会话。

```bash
tk delete --last          # 删除最近一条记录
tk delete lq3x9k2         # 按 ID 删除
```

### `tk resume <id | --last>`

恢复已完成的任务为新的会话（复制任务名和标签）。

```bash
tk resume --last          # 恢复最近任务
tk resume lq3x9k2         # 按 ID 恢复
```

### `tk export [选项]`

导出历史数据为 CSV 或 Markdown。

| 选项 | 说明 |
|------|------|
| `--format csv\|markdown` | 输出格式（默认 csv） |
| `--output <file>` | 输出到文件（默认 stdout） |

```bash
tk export                           # CSV 输出到终端
tk export --format markdown         # Markdown 表格输出到终端
tk export --format csv --output report.csv
```

### `tk pomodoro <task> [选项]`

番茄钟，带交互式倒计时进度条。

| 选项 | 说明 |
|------|------|
| `--work <minutes>` | 工作时长（默认 25） |
| `--break <minutes>` | 休息时长（默认 5） |
| `--rounds <n>` | 轮数（默认 4） |
| `--tag <tag>` | 添加标签 |

每个工作阶段会创建一个真实会话（标签为 `pomodoro`），可在 `tk list` 和 `tk summary` 中查看。

```bash
tk pomodoro "写代码" --work 25 --break 5 --rounds 4 --tag coding
```

### `tk sync <path>`

设置同步文件路径，用于跨设备同步（Dropbox / iCloud / OneDrive）。

```bash
# macOS / Linux
tk sync ~/Dropbox/cace-timer.json

# Windows
tk sync "%USERPROFILE%\Dropbox\cace-timer.json"
```

### `--lang <zh|en>`

设置语言。自动检测系统语言。设置后持久化到配置。

```bash
tk --lang en help
tk --lang zh status
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
  "lang": "zh",
  "current": null,
  "history": [
    {
      "id": "lq3x9k2",
      "task": "写周报",
      "start": "2024-03-02T10:00:00.000Z",
      "end": "2024-03-02T10:30:00.000Z",
      "tags": ["work", "daily"],
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

详见 [CHANGELOG.md](CHANGELOG.md)。

## 许可

MIT
