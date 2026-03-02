# CACE TIMER

一个极简的时间记录 CLI 工具，配有可爱的短发小女孩动画吉祥物。

## 安装

```bash
cd timekeeper
npm link
```

安装后全局命令 `tk` 即可使用。

## 快速开始

```bash
# 开始一个任务
tk start "写周报" --tag work --estimate 30

# 记录进度节点
tk mark "完成数据分析"

# 查看当前状态
tk status

# 结束任务（显示效率评分）
tk stop
```

## 命令一览

### tk start

开始新任务。

```bash
tk start <任务名> [选项]

选项:
  --tag <标签>       添加标签
  --estimate <分钟>  预估时长（用于计算效率分）
```

示例：
```bash
tk start "开发登录功能" --tag coding --estimate 60
```

### tk mark

记录时间节点。

```bash
tk mark <备注>
```

示例：
```bash
tk mark "完成API接口"
tk mark "开始写测试"
```

### tk stop

结束当前任务，显示总结和效率评分。

```bash
tk stop
```

效率评分规则：
- 实际时长 ≤ 预估时长 → 100%（🏆 优秀）
- 实际时长稍超预估 → 80-99%（💪 良好）
- 实际时长远超预估 → <50%（💀 需改进）

### tk status

查看当前进行中的任务状态。

```bash
tk status
```

### tk list

查看历史记录。

```bash
tk list [选项]

选项:
  --today         仅显示今天
  --tag <标签>    按标签筛选
  --limit <数量>  限制显示数量（默认10）
```

示例：
```bash
tk list --today
tk list --tag coding --limit 20
```

### tk search

搜索历史记录。

```bash
tk search <关键词>
```

会搜索任务名、标签、标记备注。

```bash
tk search "登录"
tk search "coding"
```

### tk sync

设置同步文件路径，实现跨设备同步。

```bash
tk sync <文件路径>
```

建议将同步文件放在云盘目录：
```bash
tk sync ~/Dropbox/cace-timer.json
tk sync ~/OneDrive/cace-timer.json
```

## 数据同步指南

### 工作原理

CACE TIMER 采用**单文件同步**策略：

```
┌─────────────┐         ┌─────────────┐
│   设备 A    │         │   设备 B    │
│  ~/(本地)   │         │  ~/(本地)   │
│ .cace-timer │         │ .cace-timer │
│    .json    │         │    .json    │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────────────────────────────┐
│         云盘同步目录                  │
│   Dropbox / iCloud / OneDrive       │
│        cace-timer.json              │
└─────────────────────────────────────┘
```

每次执行 `tk` 命令时：
1. 写入本地 `~/.cace-timer.json`
2. 同时写入配置的 `syncPath`（如果设置了）

### 设置步骤

#### Dropbox

```bash
# macOS / Linux
tk sync ~/Dropbox/cace-timer.json

# Windows
tk sync "%USERPROFILE%\Dropbox\cace-timer.json"
```

#### iCloud

```bash
# macOS
tk sync ~/Library/Mobile\ Documents/com~apple~CloudDocs/cace-timer.json
```

#### OneDrive

```bash
# macOS
tk sync ~/OneDrive/cace-timer.json

# Windows
tk sync "%USERPROFILE%\OneDrive\cace-timer.json"
```

#### 自建同步 (Syncthing / Resilio)

```bash
tk sync ~/Sync/cace-timer.json
```

### 多设备使用

**首次在设备 B 使用：**

```bash
# 1. 安装 CACE TIMER
cd timekeeper && npm link

# 2. 设置同步路径（指向云盘已同步的文件）
tk sync ~/Dropbox/cace-timer.json

# 3. 查看同步的数据
tk list
```

**注意：** 新设备需要先设置 `tk sync`，然后才能读取云盘数据。

### 同步冲突处理

由于采用单文件策略，建议：

| 场景 | 建议 |
|------|------|
| 多设备同时使用 | 避免同时在多个设备操作 |
| 云盘同步延迟 | 操作后等待几秒再切换设备 |
| 冲突文件 | 手动合并 JSON，保留需要的记录 |

### 手动备份

```bash
# 导出备份
cp ~/.cace-timer.json ~/backup/cace-timer-$(date +%Y%m%d).json

# 恢复备份
cp ~/backup/cace-timer-20240302.json ~/.cace-timer.json
```

### 数据格式

同步文件为标准 JSON 格式：

```json
{
  "syncPath": "/Users/you/Dropbox/cace-timer.json",
  "current": null,
  "history": [
    {
      "id": "lq3x9k2",
      "task": "开发功能",
      "start": "2024-03-02T10:00:00.000Z",
      "end": "2024-03-02T11:30:00.000Z",
      "tags": ["coding"],
      "marks": [
        { "time": "2024-03-02T10:30:00.000Z", "note": "完成API" }
      ],
      "estimatedMinutes": 60
    }
  ]
}
```

### 取消同步

编辑 `~/.cace-timer.json`，删除 `syncPath` 字段即可。

---

### tk help

显示帮助信息。

```bash
tk help
```

## CACE 吉祥物

CACE 是一个可爱的短发小女孩头像：

```
   ▄▄▄▄▄▄▄▄▄▄▄
  █░░░░░░░░░░░█   ← 刘海
  █░▄▄▄▄▄▄▄▄▄░█
  █░│ ●   ● │░█   ← 大眼睛
  █░│   ▽   │░█   ← 小鼻子
  █░│  ───  │░█   ← 嘴巴
  ╰───────────╯
```

**动画表情：**

| 状态 | 眼睛 | 嘴巴 | 触发场景 |
|------|------|------|----------|
| 正常 | ● ● | ─── | 默认状态 |
| 开心 | ★ ★ | ◡◡◡ | 完成任务 |
| 眨眼 | ─ ─ | ─── | 动画帧 |
| 超开心 | ◉ ◉ | ▽△▽ | 动画帧 |
| 困倦 | ─ ─ | ─── | 无任务时 |

动画循环：正常 → 眨眼 → 开心 → 超开心（循环2次）

## 数据存储

数据保存在 `~/.cace-timer.json`：

```json
{
  "syncPath": "~/Dropbox/cace-timer.json",
  "current": null,
  "history": [
    {
      "id": "xxx",
      "task": "写周报",
      "start": "2024-03-02T10:00:00Z",
      "end": "2024-03-02T10:30:00Z",
      "tags": ["work"],
      "marks": [
        { "time": "2024-03-02T10:15:00Z", "note": "完成数据分析" }
      ],
      "estimatedMinutes": 30
    }
  ]
}
```

## 使用场景

- **编程开发**：记录编码时间，评估效率
- **学习复习**：跟踪学习时长和进度
- **项目管理**：标记关键节点，回顾时间分配
- **自由职业**：为客户项目计时

## 卸载

```bash
npm unlink -g cace-timer
```

## License

MIT
